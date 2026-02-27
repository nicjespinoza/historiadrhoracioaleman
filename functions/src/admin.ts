import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
    setUserRole,
    revokeUserRole,
    renewUserToken,
    forceUserLogout,
    isTokenExpired,
    getUserRole,
    isAdmin,
    UserRole,
    ASSIGNABLE_ROLES,
    ROLE_NAMES,
} from "./roles";
import {
    createAuditLog,
    getAuditLogsForUser,
    getAuditLogsByAction,
    AuditAction,
} from "./auditLogs";

// ============================================================
// HELPER: Verificar Admin
// ============================================================

async function verifyAdminAccess(auth: { uid: string } | undefined): Promise<void> {
    if (!auth) {
        throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
    }

    const isUserAdmin = await isAdmin(auth.uid);
    if (!isUserAdmin) {
        await createAuditLog("LOGIN_FAILED", auth.uid, {
            metadata: {
                reason: "unauthorized_admin_access_attempt",
            },
        });
        throw new HttpsError("permission-denied", "No tienes permisos de administrador.");
    }
}

// ============================================================
// GESTIÓN DE ROLES - 4 ROLES: admin, doctor, assistant, patient
// ============================================================

/**
 * Asignar rol a un usuario
 * Solo para admins
 * Roles disponibles: admin, doctor, assistant (asistente), patient (paciente)
 */
export const assignUserRole = onCall(async (request) => {
    await verifyAdminAccess(request.auth);

    const { targetUserId, role, expirationHours } = request.data as {
        targetUserId: string;
        role: UserRole;
        expirationHours?: number;
    };

    if (!targetUserId || !role) {
        throw new HttpsError("invalid-argument", "targetUserId y role son requeridos.");
    }

    // Validar que el rol sea uno de los 4 permitidos
    if (!ASSIGNABLE_ROLES.includes(role)) {
        const roleList = ASSIGNABLE_ROLES.map(r => `${r} (${ROLE_NAMES[r]})`).join(", ");
        throw new HttpsError("invalid-argument", `Rol inválido. Roles disponibles: ${roleList}`);
    }

    try {
        await setUserRole(
            targetUserId,
            role,
            request.auth!.uid,
            expirationHours || 24 * 30,
            request.rawRequest?.ip
        );

        return {
            success: true,
            message: `Rol ${role} asignado exitosamente a ${targetUserId}`,
        };
    } catch (error: any) {
        console.error("Error assigning role:", error);
        throw new HttpsError("internal", `Error asignando rol: ${error.message}`);
    }
});

/**
 * Revocar rol de un usuario (volver a patient)
 * Solo para admins
 */
export const revokeRole = onCall(async (request) => {
    await verifyAdminAccess(request.auth);

    const { targetUserId } = request.data as { targetUserId: string };

    if (!targetUserId) {
        throw new HttpsError("invalid-argument", "targetUserId es requerido.");
    }

    try {
        await revokeUserRole(
            targetUserId,
            request.auth!.uid,
            request.rawRequest?.ip
        );

        return {
            success: true,
            message: `Rol revocado para ${targetUserId}`,
        };
    } catch (error: any) {
        console.error("Error revoking role:", error);
        throw new HttpsError("internal", `Error revocando rol: ${error.message}`);
    }
});

// ============================================================
// GESTIÓN DE TOKENS
// ============================================================

/**
 * Renovar token de un usuario
 * El usuario puede renovar su propio token, o un admin puede renovar cualquiera
 */
export const renewToken = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
    }

    const { targetUserId, expirationHours } = request.data as {
        targetUserId?: string;
        expirationHours?: number;
    };

    // Si no se especifica target, renovar el propio token
    const userId = targetUserId || request.auth.uid;

    // Si es para otro usuario, verificar que sea admin
    if (targetUserId && targetUserId !== request.auth.uid) {
        await verifyAdminAccess(request.auth);
    }

    try {
        await renewUserToken(
            userId,
            expirationHours || 24 * 7,
            request.rawRequest?.ip
        );

        return {
            success: true,
            message: "Token renovado exitosamente",
        };
    } catch (error: any) {
        console.error("Error renewing token:", error);
        throw new HttpsError("internal", `Error renovando token: ${error.message}`);
    }
});

/**
 * Forzar cierre de sesión de un usuario
 * Solo para admins
 */
export const forceLogout = onCall(async (request) => {
    await verifyAdminAccess(request.auth);

    const { targetUserId, reason } = request.data as {
        targetUserId: string;
        reason: string;
    };

    if (!targetUserId || !reason) {
        throw new HttpsError("invalid-argument", "targetUserId y reason son requeridos.");
    }

    try {
        await forceUserLogout(
            targetUserId,
            request.auth!.uid,
            reason,
            request.rawRequest?.ip
        );

        return {
            success: true,
            message: `Sesión cerrada forzosamente para ${targetUserId}`,
        };
    } catch (error: any) {
        console.error("Error forcing logout:", error);
        throw new HttpsError("internal", `Error cerrando sesión: ${error.message}`);
    }
});

/**
 * Verificar si un token ha expirado
 */
export const checkTokenExpiration = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
    }

    const { targetUserId } = request.data as { targetUserId?: string };
    const userId = targetUserId || request.auth.uid;

    // Si es para otro usuario, verificar que sea admin
    if (targetUserId && targetUserId !== request.auth.uid) {
        await verifyAdminAccess(request.auth);
    }

    try {
        const expired = await isTokenExpired(userId);
        const role = await getUserRole(userId);

        return {
            userId,
            role,
            expired,
            message: expired ? "El token ha expirado" : "El token es válido",
        };
    } catch (error: any) {
        console.error("Error checking token:", error);
        throw new HttpsError("internal", `Error verificando token: ${error.message}`);
    }
});

// ============================================================
// CONSULTA DE AUDIT LOGS
// ============================================================

/**
 * Obtener logs de auditoría
 * Solo para admins
 */
export const getAuditLogs = onCall(async (request) => {
    await verifyAdminAccess(request.auth);

    const { userId, action, limit } = request.data as {
        userId?: string;
        action?: AuditAction;
        limit?: number;
    };

    try {
        let logs: admin.firestore.QueryDocumentSnapshot[];

        if (userId) {
            logs = await getAuditLogsForUser(userId, limit || 50);
        } else if (action) {
            logs = await getAuditLogsByAction(action, limit || 50);
        } else {
            // Obtener logs más recientes
            const snapshot = await admin.firestore()
                .collection("auditLogs")
                .orderBy("createdAt", "desc")
                .limit(limit || 50)
                .get();
            logs = snapshot.docs;
        }

        return {
            success: true,
            count: logs.length,
            logs: logs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })),
        };
    } catch (error: any) {
        console.error("Error getting audit logs:", error);
        throw new HttpsError("internal", `Error obteniendo logs: ${error.message}`);
    }
});

/**
 * Obtener estadísticas de audit logs
 * Solo para admins
 */
export const getAuditStats = onCall(async (request) => {
    await verifyAdminAccess(request.auth);

    try {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Contar logs de las últimas 24 horas
        const recentSnapshot = await admin.firestore()
            .collection("auditLogs")
            .where("createdAt", ">=", last24h)
            .get();

        // Contar por tipo de acción
        const actionCounts: Record<string, number> = {};
        recentSnapshot.docs.forEach((doc) => {
            const action = doc.data().action;
            actionCounts[action] = (actionCounts[action] || 0) + 1;
        });

        // Contar intentos fallidos de login
        const failedLogins = recentSnapshot.docs.filter(
            (doc) => doc.data().action === "LOGIN_FAILED"
        ).length;

        return {
            success: true,
            stats: {
                totalLast24h: recentSnapshot.size,
                actionCounts,
                failedLogins,
                timestamp: now.toISOString(),
            },
        };
    } catch (error: any) {
        console.error("Error getting audit stats:", error);
        throw new HttpsError("internal", `Error obteniendo estadísticas: ${error.message}`);
    }
});

// ============================================================
// GESTIÓN DE USUARIOS
// ============================================================

/**
 * Listar todos los usuarios con sus roles
 * Solo para admins
 */
export const listUsers = onCall(async (request) => {
    await verifyAdminAccess(request.auth);

    const { limit, pageToken } = request.data as {
        limit?: number;
        pageToken?: string;
    };

    try {
        const listResult = await admin.auth().listUsers(limit || 100, pageToken);

        const users = listResult.users.map((user) => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: (user.customClaims as any)?.role || "patient",
            disabled: user.disabled,
            lastSignIn: user.metadata.lastSignInTime,
            createdAt: user.metadata.creationTime,
        }));

        return {
            success: true,
            users,
            nextPageToken: listResult.pageToken,
        };
    } catch (error: any) {
        console.error("Error listing users:", error);
        throw new HttpsError("internal", `Error listando usuarios: ${error.message}`);
    }
});

/**
 * Deshabilitar/habilitar usuario
 * Solo para admins
 */
export const toggleUserStatus = onCall(async (request) => {
    await verifyAdminAccess(request.auth);

    const { targetUserId, disabled, reason } = request.data as {
        targetUserId: string;
        disabled: boolean;
        reason?: string;
    };

    if (!targetUserId || disabled === undefined) {
        throw new HttpsError("invalid-argument", "targetUserId y disabled son requeridos.");
    }

    try {
        await admin.auth().updateUser(targetUserId, { disabled });

        await createAuditLog(
            disabled ? "USER_DELETED" : "USER_UPDATED",
            request.auth!.uid,
            {
                targetId: targetUserId,
                targetCollection: "users",
                metadata: {
                    action: disabled ? "disabled" : "enabled",
                    reason,
                },
            }
        );

        return {
            success: true,
            message: disabled
                ? `Usuario ${targetUserId} deshabilitado`
                : `Usuario ${targetUserId} habilitado`,
        };
    } catch (error: any) {
        console.error("Error toggling user status:", error);
        throw new HttpsError("internal", `Error: ${error.message}`);
    }
});
