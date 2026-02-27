/**
 * Audit Logs Module for Historia Clínica
 * 
 * Este módulo proporciona funciones para registrar acciones críticas
 * en la colección auditLogs de Firestore. Solo se puede escribir
 * desde Cloud Functions (Admin SDK), nunca desde el cliente.
 */

import * as admin from "firebase-admin";

// ============================================================
// TIPOS DE AUDIT LOG
// ============================================================

export type AuditAction =
    | "USER_CREATED"
    | "USER_UPDATED"
    | "USER_DELETED"
    | "ROLE_CHANGED"
    | "PATIENT_CREATED"
    | "PATIENT_UPDATED"
    | "PATIENT_DELETED"
    | "APPOINTMENT_CREATED"
    | "APPOINTMENT_UPDATED"
    | "APPOINTMENT_CANCELLED"
    | "HISTORY_CREATED"
    | "HISTORY_UPDATED"
    | "HISTORY_DELETED"
    | "CONSULT_CREATED"
    | "CONSULT_UPDATED"
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "TOKEN_REFRESHED"
    | "PAYMENT_INITIATED"
    | "PAYMENT_COMPLETED"
    | "PAYMENT_FAILED";

export interface AuditLogEntry {
    action: AuditAction;
    userId: string;
    targetId?: string;          // ID del documento afectado
    targetCollection?: string;  // Colección afectada
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    previousData?: Record<string, any>;
    newData?: Record<string, any>;
    createdAt: admin.firestore.FieldValue;
}

// ============================================================
// FUNCIONES DE AUDIT LOG
// ============================================================

/**
 * Crear un registro de auditoría
 * Solo llamar desde Cloud Functions (Admin SDK)
 */
export async function createAuditLog(
    action: AuditAction,
    userId: string,
    details?: {
        targetId?: string;
        targetCollection?: string;
        ipAddress?: string;
        userAgent?: string;
        previousData?: Record<string, any>;
        newData?: Record<string, any>;
        metadata?: Record<string, any>;
    }
): Promise<string> {
    const logEntry: AuditLogEntry = {
        action,
        userId,
        targetId: details?.targetId,
        targetCollection: details?.targetCollection,
        details: details?.metadata,
        ipAddress: details?.ipAddress,
        userAgent: details?.userAgent,
        previousData: details?.previousData,
        newData: details?.newData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Eliminar campos undefined
    const cleanEntry = Object.fromEntries(
        Object.entries(logEntry).filter(([_, v]) => v !== undefined)
    );

    const docRef = await admin.firestore()
        .collection("auditLogs")
        .add(cleanEntry);

    console.log(`Audit log created: ${action} by ${userId} - Doc ID: ${docRef.id}`);
    return docRef.id;
}

/**
 * Registrar cambio de rol de usuario
 */
export async function logRoleChange(
    adminUserId: string,
    targetUserId: string,
    previousRole: string,
    newRole: string,
    ipAddress?: string
): Promise<string> {
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
export async function logLoginAttempt(
    userId: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    failureReason?: string
): Promise<string> {
    return createAuditLog(
        success ? "LOGIN_SUCCESS" : "LOGIN_FAILED",
        userId,
        {
            ipAddress,
            userAgent,
            metadata: success ? undefined : { failureReason },
        }
    );
}

/**
 * Registrar evento de pago
 */
export async function logPaymentEvent(
    userId: string,
    appointmentId: string,
    action: "PAYMENT_INITIATED" | "PAYMENT_COMPLETED" | "PAYMENT_FAILED",
    amount: number,
    gateway: string,
    transactionId?: string,
    errorMessage?: string
): Promise<string> {
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
export async function logMedicalRecordDeletion(
    doctorId: string,
    patientId: string,
    recordId: string,
    recordType: "history" | "consult" | "observation",
    ipAddress?: string
): Promise<string> {
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
export async function getAuditLogsForUser(
    userId: string,
    limit: number = 50
): Promise<admin.firestore.QueryDocumentSnapshot[]> {
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
export async function getAuditLogsByAction(
    action: AuditAction,
    limit: number = 50
): Promise<admin.firestore.QueryDocumentSnapshot[]> {
    const snapshot = await admin.firestore()
        .collection("auditLogs")
        .where("action", "==", action)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

    return snapshot.docs;
}
