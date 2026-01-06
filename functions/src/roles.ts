/**
 * User Roles and Token Management Module for Historia Clínica
 * 
 * Este módulo proporciona funciones para gestionar roles de usuarios
 * y tokens de sesión con expiración. Implementa la lógica de seguridad
 * que complementa las Firestore Rules.
 */

import * as admin from "firebase-admin";
import { createAuditLog, logRoleChange } from "./auditLogs";

// ============================================================
// TIPOS DE ROL - 4 ROLES DISPONIBLES
// ============================================================

// Los 4 roles del sistema: admin, doctor, assistant (asistente), patient (paciente)
export type UserRole = "admin" | "doctor" | "assistant" | "patient";

// Roles que pueden ser asignados por administradores
export const ASSIGNABLE_ROLES: UserRole[] = ["admin", "doctor", "assistant", "patient"];

// Nombres en español para mostrar en UI
export const ROLE_NAMES: Record<UserRole, string> = {
    admin: "Administrador",
    doctor: "Doctor",
    assistant: "Asistente",
    patient: "Paciente",
};

export interface UserTokenClaims {
    role: UserRole;
    expiresAt?: number;  // Timestamp en milisegundos
    permissions?: string[];
}

// ============================================================
// GESTIÓN DE ROLES
// ============================================================

/**
 * Asignar un rol a un usuario con Custom Claims
 * Solo puede ser llamado por un admin
 */
export async function setUserRole(
    targetUserId: string,
    newRole: UserRole,
    adminUserId: string,
    expirationHours: number = 24 * 30, // 30 días por defecto
    ipAddress?: string
): Promise<void> {
    // Obtener rol actual para audit log
    const userRecord = await admin.auth().getUser(targetUserId);
    const currentClaims = userRecord.customClaims || {};
    const previousRole = currentClaims.role || "patient";

    // Calcular timestamp de expiración
    const expiresAt = Date.now() + (expirationHours * 60 * 60 * 1000);

    // Establecer nuevos claims
    const newClaims: UserTokenClaims = {
        role: newRole,
        expiresAt,
        permissions: getRolePermissions(newRole),
    };

    await admin.auth().setCustomUserClaims(targetUserId, newClaims);

    // Registrar cambio en audit log
    await logRoleChange(
        adminUserId,
        targetUserId,
        previousRole,
        newRole,
        ipAddress
    );

    // Actualizar documento de usuario en Firestore
    await admin.firestore().collection("users").doc(targetUserId).update({
        role: newRole,
        roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        roleUpdatedBy: adminUserId,
    });

    console.log(`Role updated for ${targetUserId}: ${previousRole} -> ${newRole}`);
}

/**
 * Obtener permisos por rol
 */
function getRolePermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
        patient: [
            "read:own_profile",
            "update:own_profile",
            "read:own_appointments",
            "create:appointments",
            "read:own_histories",
        ],
        doctor: [
            "read:all_patients",
            "update:patients",
            "create:histories",
            "update:histories",
            "delete:histories",
            "create:consults",
            "update:consults",
            "manage:appointments",
            "create:observations",
        ],
        assistant: [
            "read:all_patients",
            "create:appointments",
            "update:appointments",
            "read:histories",
            "send:notifications",
        ],
        admin: [
            "manage:users",
            "manage:roles",
            "read:audit_logs",
            "manage:all_data",
            "delete:users",
        ],
    };

    return permissions[role] || [];
}

/**
 * Revocar rol de un usuario (volver a patient)
 */
export async function revokeUserRole(
    targetUserId: string,
    adminUserId: string,
    ipAddress?: string
): Promise<void> {
    await setUserRole(targetUserId, "patient", adminUserId, 24 * 365, ipAddress);

    await createAuditLog("ROLE_CHANGED", adminUserId, {
        targetId: targetUserId,
        targetCollection: "users",
        metadata: {
            action: "revoke",
            message: "Role revoked, user returned to patient",
        },
        ipAddress,
    });
}

// ============================================================
// GESTIÓN DE TOKENS CON EXPIRACIÓN
// ============================================================

/**
 * Verificar si el token de un usuario ha expirado
 */
export async function isTokenExpired(userId: string): Promise<boolean> {
    const userRecord = await admin.auth().getUser(userId);
    const claims = userRecord.customClaims as UserTokenClaims | undefined;

    if (!claims || !claims.expiresAt) {
        return false; // Sin expiración = válido
    }

    return claims.expiresAt < Date.now();
}

/**
 * Renovar el token de un usuario
 */
export async function renewUserToken(
    userId: string,
    expirationHours: number = 24 * 7, // 7 días por defecto
    ipAddress?: string
): Promise<void> {
    const userRecord = await admin.auth().getUser(userId);
    const currentClaims = userRecord.customClaims as UserTokenClaims || { role: "patient" };

    const newExpiresAt = Date.now() + (expirationHours * 60 * 60 * 1000);

    await admin.auth().setCustomUserClaims(userId, {
        ...currentClaims,
        expiresAt: newExpiresAt,
    });

    await createAuditLog("TOKEN_REFRESHED", userId, {
        ipAddress,
        metadata: {
            newExpiresAt: new Date(newExpiresAt).toISOString(),
            expirationHours,
        },
    });

    console.log(`Token renewed for ${userId} until ${new Date(newExpiresAt).toISOString()}`);
}

/**
 * Forzar cierre de sesión de un usuario
 * Revoca todos los refresh tokens
 */
export async function forceUserLogout(
    targetUserId: string,
    adminUserId: string,
    reason: string,
    ipAddress?: string
): Promise<void> {
    // Revocar todos los refresh tokens
    await admin.auth().revokeRefreshTokens(targetUserId);

    // Establecer expiración inmediata
    const userRecord = await admin.auth().getUser(targetUserId);
    const currentClaims = userRecord.customClaims as UserTokenClaims || { role: "patient" };

    await admin.auth().setCustomUserClaims(targetUserId, {
        ...currentClaims,
        expiresAt: Date.now() - 1000, // Ya expirado
    });

    await createAuditLog("TOKEN_REFRESHED", adminUserId, {
        targetId: targetUserId,
        metadata: {
            action: "force_logout",
            reason,
        },
        ipAddress,
    });

    console.log(`Force logout for ${targetUserId} by ${adminUserId}: ${reason}`);
}

// ============================================================
// VERIFICACIÓN DE PERMISOS
// ============================================================

/**
 * Verificar si un usuario tiene un permiso específico
 */
export async function hasPermission(
    userId: string,
    permission: string
): Promise<boolean> {
    const userRecord = await admin.auth().getUser(userId);
    const claims = userRecord.customClaims as UserTokenClaims | undefined;

    if (!claims?.permissions) {
        return false;
    }

    // Admin tiene todos los permisos
    if (claims.role === "admin") {
        return true;
    }

    return claims.permissions.includes(permission);
}

/**
 * Obtener rol actual de un usuario
 */
export async function getUserRole(userId: string): Promise<UserRole> {
    const userRecord = await admin.auth().getUser(userId);
    const claims = userRecord.customClaims as UserTokenClaims | undefined;

    return claims?.role || "patient";
}

/**
 * Verificar si el usuario es admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const role = await getUserRole(userId);
    return role === "admin";
}

/**
 * Verificar si el usuario es doctor o admin
 */
export async function isPrivileged(userId: string): Promise<boolean> {
    const role = await getUserRole(userId);
    return role === "doctor" || role === "admin";
}
