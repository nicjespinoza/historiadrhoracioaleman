"use strict";
/**
 * User Roles and Token Management Module for Historia Clínica
 *
 * Este módulo proporciona funciones para gestionar roles de usuarios
 * y tokens de sesión con expiración. Implementa la lógica de seguridad
 * que complementa las Firestore Rules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_NAMES = exports.ASSIGNABLE_ROLES = void 0;
exports.setUserRole = setUserRole;
exports.revokeUserRole = revokeUserRole;
exports.isTokenExpired = isTokenExpired;
exports.renewUserToken = renewUserToken;
exports.forceUserLogout = forceUserLogout;
exports.hasPermission = hasPermission;
exports.getUserRole = getUserRole;
exports.isAdmin = isAdmin;
exports.isPrivileged = isPrivileged;
const admin = require("firebase-admin");
const auditLogs_1 = require("./auditLogs");
// Roles que pueden ser asignados por administradores
exports.ASSIGNABLE_ROLES = ["admin", "doctor", "assistant", "patient"];
// Nombres en español para mostrar en UI
exports.ROLE_NAMES = {
    admin: "Administrador",
    doctor: "Doctor",
    assistant: "Asistente",
    patient: "Paciente",
};
// ============================================================
// GESTIÓN DE ROLES
// ============================================================
/**
 * Asignar un rol a un usuario con Custom Claims
 * Solo puede ser llamado por un admin
 */
async function setUserRole(targetUserId, newRole, adminUserId, expirationHours = 24 * 30, // 30 días por defecto
ipAddress) {
    // Obtener rol actual para audit log
    const userRecord = await admin.auth().getUser(targetUserId);
    const currentClaims = userRecord.customClaims || {};
    const previousRole = currentClaims.role || "patient";
    // Calcular timestamp de expiración
    const expiresAt = Date.now() + (expirationHours * 60 * 60 * 1000);
    // Establecer nuevos claims
    const newClaims = {
        role: newRole,
        expiresAt,
        permissions: getRolePermissions(newRole),
    };
    await admin.auth().setCustomUserClaims(targetUserId, newClaims);
    // Registrar cambio en audit log
    await (0, auditLogs_1.logRoleChange)(adminUserId, targetUserId, previousRole, newRole, ipAddress);
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
function getRolePermissions(role) {
    const permissions = {
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
async function revokeUserRole(targetUserId, adminUserId, ipAddress) {
    await setUserRole(targetUserId, "patient", adminUserId, 24 * 365, ipAddress);
    await (0, auditLogs_1.createAuditLog)("ROLE_CHANGED", adminUserId, {
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
async function isTokenExpired(userId) {
    const userRecord = await admin.auth().getUser(userId);
    const claims = userRecord.customClaims;
    if (!claims || !claims.expiresAt) {
        return false; // Sin expiración = válido
    }
    return claims.expiresAt < Date.now();
}
/**
 * Renovar el token de un usuario
 */
async function renewUserToken(userId, expirationHours = 24 * 7, // 7 días por defecto
ipAddress) {
    const userRecord = await admin.auth().getUser(userId);
    const currentClaims = userRecord.customClaims || { role: "patient" };
    const newExpiresAt = Date.now() + (expirationHours * 60 * 60 * 1000);
    await admin.auth().setCustomUserClaims(userId, Object.assign(Object.assign({}, currentClaims), { expiresAt: newExpiresAt }));
    await (0, auditLogs_1.createAuditLog)("TOKEN_REFRESHED", userId, {
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
async function forceUserLogout(targetUserId, adminUserId, reason, ipAddress) {
    // Revocar todos los refresh tokens
    await admin.auth().revokeRefreshTokens(targetUserId);
    // Establecer expiración inmediata
    const userRecord = await admin.auth().getUser(targetUserId);
    const currentClaims = userRecord.customClaims || { role: "patient" };
    await admin.auth().setCustomUserClaims(targetUserId, Object.assign(Object.assign({}, currentClaims), { expiresAt: Date.now() - 1000 }));
    await (0, auditLogs_1.createAuditLog)("TOKEN_REFRESHED", adminUserId, {
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
async function hasPermission(userId, permission) {
    const userRecord = await admin.auth().getUser(userId);
    const claims = userRecord.customClaims;
    if (!(claims === null || claims === void 0 ? void 0 : claims.permissions)) {
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
async function getUserRole(userId) {
    const userRecord = await admin.auth().getUser(userId);
    const claims = userRecord.customClaims;
    return (claims === null || claims === void 0 ? void 0 : claims.role) || "patient";
}
/**
 * Verificar si el usuario es admin
 */
async function isAdmin(userId) {
    const role = await getUserRole(userId);
    return role === "admin";
}
/**
 * Verificar si el usuario es doctor o admin
 */
async function isPrivileged(userId) {
    const role = await getUserRole(userId);
    return role === "doctor" || role === "admin";
}
//# sourceMappingURL=roles.js.map