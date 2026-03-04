"use strict";
/**
 * Audit Logs Module for Historia Clínica
 *
 * Este módulo proporciona funciones para registrar acciones críticas
 * en la colección auditLogs de Firestore. Solo se puede escribir
 * desde Cloud Functions (Admin SDK), nunca desde el cliente.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
exports.logRoleChange = logRoleChange;
exports.logLoginAttempt = logLoginAttempt;
exports.logPaymentEvent = logPaymentEvent;
exports.logMedicalRecordDeletion = logMedicalRecordDeletion;
exports.getAuditLogsForUser = getAuditLogsForUser;
exports.getAuditLogsByAction = getAuditLogsByAction;
const admin = require("firebase-admin");
// ============================================================
// FUNCIONES DE AUDIT LOG
// ============================================================
/**
 * Crear un registro de auditoría
 * Solo llamar desde Cloud Functions (Admin SDK)
 */
async function createAuditLog(action, userId, details) {
    const logEntry = {
        action,
        userId,
        targetId: details === null || details === void 0 ? void 0 : details.targetId,
        targetCollection: details === null || details === void 0 ? void 0 : details.targetCollection,
        details: details === null || details === void 0 ? void 0 : details.metadata,
        ipAddress: details === null || details === void 0 ? void 0 : details.ipAddress,
        userAgent: details === null || details === void 0 ? void 0 : details.userAgent,
        previousData: details === null || details === void 0 ? void 0 : details.previousData,
        newData: details === null || details === void 0 ? void 0 : details.newData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    // Eliminar campos undefined
    const cleanEntry = Object.fromEntries(Object.entries(logEntry).filter(([_, v]) => v !== undefined));
    const docRef = await admin.firestore()
        .collection("auditLogs")
        .add(cleanEntry);
    console.log(`Audit log created: ${action} by ${userId} - Doc ID: ${docRef.id}`);
    return docRef.id;
}
/**
 * Registrar cambio de rol de usuario
 */
async function logRoleChange(adminUserId, targetUserId, previousRole, newRole, ipAddress) {
    return createAuditLog("ROLE_CHANGED", adminUserId, {
        targetId: targetUserId,
        targetCollection: "users",
        previousData: { role: previousRole },
        newData: { role: newRole },
        ipAddress,
        metadata: {
            message: `Role changed from ${previousRole} to ${newRole}`,
        },
    });
}
/**
 * Registrar intento de login
 */
async function logLoginAttempt(userId, success, ipAddress, userAgent, failureReason) {
    return createAuditLog(success ? "LOGIN_SUCCESS" : "LOGIN_FAILED", userId, {
        ipAddress,
        userAgent,
        metadata: success ? undefined : { failureReason },
    });
}
/**
 * Registrar evento de pago
 */
async function logPaymentEvent(userId, appointmentId, action, amount, gateway, transactionId, errorMessage) {
    return createAuditLog(action, userId, {
        targetId: appointmentId,
        targetCollection: "appointments",
        metadata: {
            amount,
            gateway,
            transactionId,
            errorMessage,
        },
    });
}
/**
 * Registrar soft delete de historial médico
 */
async function logMedicalRecordDeletion(doctorId, patientId, recordId, recordType, ipAddress) {
    return createAuditLog("HISTORY_DELETED", doctorId, {
        targetId: recordId,
        targetCollection: `patients/${patientId}/${recordType === "history" ? "histories" : recordType === "consult" ? "consults" : "observations"}`,
        ipAddress,
        metadata: {
            patientId,
            recordType,
            deletionType: "soft_delete",
        },
    });
}
/**
 * Obtener logs de auditoría para un usuario específico
 * Solo para admins
 */
async function getAuditLogsForUser(userId, limit = 50) {
    const snapshot = await admin.firestore()
        .collection("auditLogs")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();
    return snapshot.docs;
}
/**
 * Obtener logs de auditoría para una acción específica
 * Solo para admins
 */
async function getAuditLogsByAction(action, limit = 50) {
    const snapshot = await admin.firestore()
        .collection("auditLogs")
        .where("action", "==", action)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();
    return snapshot.docs;
}
//# sourceMappingURL=auditLogs.js.map