"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserStatus = exports.listUsers = exports.getAuditStats = exports.getAuditLogs = exports.checkTokenExpiration = exports.forceLogout = exports.renewToken = exports.revokeRole = exports.assignUserRole = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const roles_1 = require("./roles");
const auditLogs_1 = require("./auditLogs");
// ============================================================
// HELPER: Verificar Admin
// ============================================================
async function verifyAdminAccess(auth) {
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "Debes iniciar sesión.");
    }
    const isUserAdmin = await (0, roles_1.isAdmin)(auth.uid);
    if (!isUserAdmin) {
        await (0, auditLogs_1.createAuditLog)("LOGIN_FAILED", auth.uid, {
            metadata: {
                reason: "unauthorized_admin_access_attempt",
            },
        });
        throw new https_1.HttpsError("permission-denied", "No tienes permisos de administrador.");
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
exports.assignUserRole = (0, https_1.onCall)(async (request) => {
    var _a;
    await verifyAdminAccess(request.auth);
    const { targetUserId, role, expirationHours } = request.data;
    if (!targetUserId || !role) {
        throw new https_1.HttpsError("invalid-argument", "targetUserId y role son requeridos.");
    }
    // Validar que el rol sea uno de los 4 permitidos
    if (!roles_1.ASSIGNABLE_ROLES.includes(role)) {
        const roleList = roles_1.ASSIGNABLE_ROLES.map(r => `${r} (${roles_1.ROLE_NAMES[r]})`).join(", ");
        throw new https_1.HttpsError("invalid-argument", `Rol inválido. Roles disponibles: ${roleList}`);
    }
    try {
        await (0, roles_1.setUserRole)(targetUserId, role, request.auth.uid, expirationHours || 24 * 30, (_a = request.rawRequest) === null || _a === void 0 ? void 0 : _a.ip);
        return {
            success: true,
            message: `Rol ${role} asignado exitosamente a ${targetUserId}`,
        };
    }
    catch (error) {
        console.error("Error assigning role:", error);
        throw new https_1.HttpsError("internal", `Error asignando rol: ${error.message}`);
    }
});
/**
 * Revocar rol de un usuario (volver a patient)
 * Solo para admins
 */
exports.revokeRole = (0, https_1.onCall)(async (request) => {
    var _a;
    await verifyAdminAccess(request.auth);
    const { targetUserId } = request.data;
    if (!targetUserId) {
        throw new https_1.HttpsError("invalid-argument", "targetUserId es requerido.");
    }
    try {
        await (0, roles_1.revokeUserRole)(targetUserId, request.auth.uid, (_a = request.rawRequest) === null || _a === void 0 ? void 0 : _a.ip);
        return {
            success: true,
            message: `Rol revocado para ${targetUserId}`,
        };
    }
    catch (error) {
        console.error("Error revoking role:", error);
        throw new https_1.HttpsError("internal", `Error revocando rol: ${error.message}`);
    }
});
// ============================================================
// GESTIÓN DE TOKENS
// ============================================================
/**
 * Renovar token de un usuario
 * El usuario puede renovar su propio token, o un admin puede renovar cualquiera
 */
exports.renewToken = (0, https_1.onCall)(async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Debes iniciar sesión.");
    }
    const { targetUserId, expirationHours } = request.data;
    // Si no se especifica target, renovar el propio token
    const userId = targetUserId || request.auth.uid;
    // Si es para otro usuario, verificar que sea admin
    if (targetUserId && targetUserId !== request.auth.uid) {
        await verifyAdminAccess(request.auth);
    }
    try {
        await (0, roles_1.renewUserToken)(userId, expirationHours || 24 * 7, (_a = request.rawRequest) === null || _a === void 0 ? void 0 : _a.ip);
        return {
            success: true,
            message: "Token renovado exitosamente",
        };
    }
    catch (error) {
        console.error("Error renewing token:", error);
        throw new https_1.HttpsError("internal", `Error renovando token: ${error.message}`);
    }
});
/**
 * Forzar cierre de sesión de un usuario
 * Solo para admins
 */
exports.forceLogout = (0, https_1.onCall)(async (request) => {
    var _a;
    await verifyAdminAccess(request.auth);
    const { targetUserId, reason } = request.data;
    if (!targetUserId || !reason) {
        throw new https_1.HttpsError("invalid-argument", "targetUserId y reason son requeridos.");
    }
    try {
        await (0, roles_1.forceUserLogout)(targetUserId, request.auth.uid, reason, (_a = request.rawRequest) === null || _a === void 0 ? void 0 : _a.ip);
        return {
            success: true,
            message: `Sesión cerrada forzosamente para ${targetUserId}`,
        };
    }
    catch (error) {
        console.error("Error forcing logout:", error);
        throw new https_1.HttpsError("internal", `Error cerrando sesión: ${error.message}`);
    }
});
/**
 * Verificar si un token ha expirado
 */
exports.checkTokenExpiration = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Debes iniciar sesión.");
    }
    const { targetUserId } = request.data;
    const userId = targetUserId || request.auth.uid;
    // Si es para otro usuario, verificar que sea admin
    if (targetUserId && targetUserId !== request.auth.uid) {
        await verifyAdminAccess(request.auth);
    }
    try {
        const expired = await (0, roles_1.isTokenExpired)(userId);
        const role = await (0, roles_1.getUserRole)(userId);
        return {
            userId,
            role,
            expired,
            message: expired ? "El token ha expirado" : "El token es válido",
        };
    }
    catch (error) {
        console.error("Error checking token:", error);
        throw new https_1.HttpsError("internal", `Error verificando token: ${error.message}`);
    }
});
// ============================================================
// CONSULTA DE AUDIT LOGS
// ============================================================
/**
 * Obtener logs de auditoría
 * Solo para admins
 */
exports.getAuditLogs = (0, https_1.onCall)(async (request) => {
    await verifyAdminAccess(request.auth);
    const { userId, action, limit } = request.data;
    try {
        let logs;
        if (userId) {
            logs = await (0, auditLogs_1.getAuditLogsForUser)(userId, limit || 50);
        }
        else if (action) {
            logs = await (0, auditLogs_1.getAuditLogsByAction)(action, limit || 50);
        }
        else {
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
            logs: logs.map((doc) => (Object.assign({ id: doc.id }, doc.data()))),
        };
    }
    catch (error) {
        console.error("Error getting audit logs:", error);
        throw new https_1.HttpsError("internal", `Error obteniendo logs: ${error.message}`);
    }
});
/**
 * Obtener estadísticas de audit logs
 * Solo para admins
 */
exports.getAuditStats = (0, https_1.onCall)(async (request) => {
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
        const actionCounts = {};
        recentSnapshot.docs.forEach((doc) => {
            const action = doc.data().action;
            actionCounts[action] = (actionCounts[action] || 0) + 1;
        });
        // Contar intentos fallidos de login
        const failedLogins = recentSnapshot.docs.filter((doc) => doc.data().action === "LOGIN_FAILED").length;
        return {
            success: true,
            stats: {
                totalLast24h: recentSnapshot.size,
                actionCounts,
                failedLogins,
                timestamp: now.toISOString(),
            },
        };
    }
    catch (error) {
        console.error("Error getting audit stats:", error);
        throw new https_1.HttpsError("internal", `Error obteniendo estadísticas: ${error.message}`);
    }
});
// ============================================================
// GESTIÓN DE USUARIOS
// ============================================================
/**
 * Listar todos los usuarios con sus roles
 * Solo para admins
 */
exports.listUsers = (0, https_1.onCall)(async (request) => {
    await verifyAdminAccess(request.auth);
    const { limit, pageToken } = request.data;
    try {
        const listResult = await admin.auth().listUsers(limit || 100, pageToken);
        const users = listResult.users.map((user) => {
            var _a;
            return ({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: ((_a = user.customClaims) === null || _a === void 0 ? void 0 : _a.role) || "patient",
                disabled: user.disabled,
                lastSignIn: user.metadata.lastSignInTime,
                createdAt: user.metadata.creationTime,
            });
        });
        return {
            success: true,
            users,
            nextPageToken: listResult.pageToken,
        };
    }
    catch (error) {
        console.error("Error listing users:", error);
        throw new https_1.HttpsError("internal", `Error listando usuarios: ${error.message}`);
    }
});
/**
 * Deshabilitar/habilitar usuario
 * Solo para admins
 */
exports.toggleUserStatus = (0, https_1.onCall)(async (request) => {
    await verifyAdminAccess(request.auth);
    const { targetUserId, disabled, reason } = request.data;
    if (!targetUserId || disabled === undefined) {
        throw new https_1.HttpsError("invalid-argument", "targetUserId y disabled son requeridos.");
    }
    try {
        await admin.auth().updateUser(targetUserId, { disabled });
        await (0, auditLogs_1.createAuditLog)(disabled ? "USER_DELETED" : "USER_UPDATED", request.auth.uid, {
            targetId: targetUserId,
            targetCollection: "users",
            metadata: {
                action: disabled ? "disabled" : "enabled",
                reason,
            },
        });
        return {
            success: true,
            message: disabled
                ? `Usuario ${targetUserId} deshabilitado`
                : `Usuario ${targetUserId} habilitado`,
        };
    }
    catch (error) {
        console.error("Error toggling user status:", error);
        throw new https_1.HttpsError("internal", `Error: ${error.message}`);
    }
});
//# sourceMappingURL=admin.js.map