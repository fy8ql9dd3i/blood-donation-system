import api from './api';

/**
 * Blood Request Services for Blood Bank Staff
 */

/** GET /api/requests — Fetch all pending and historical requests */
export async function getAllRequests() {
    const { data } = await api.get('/requests');
    return data;
}

/** PATCH /api/requests/:id/status — Update status (fulfilled, cancelled) */
export async function updateRequestStatus(id, status) {
    const { data } = await api.patch(`/requests/${id}/status`, { status });
    return data;
}

/** GET /api/requests/:id — Fetch single request detail */
export async function getRequestById(id) {
    const { data } = await api.get(`/requests/${id}`);
    return data;
}
