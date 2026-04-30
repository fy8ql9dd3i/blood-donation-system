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
export async function updateRequestStatus(id, status, responseMessage) {
    const { data } = await api.patch(`/requests/${id}/status`, { status, responseMessage });
    return data;
}

/** GET /api/requests/:id — Fetch single request detail */
export async function getRequestById(id) {
    const { data } = await api.get(`/requests/${id}`);
    return data;
}
/** POST /api/requests/dispatch — Manual dispatch from console */
export async function manualDispatch(payload) {
    const { data } = await api.post('/requests/dispatch', payload);
    return data;
}

export async function getAllDispatches() {
    const { data } = await api.get('/requests/all-dispatches');
    return data;
}

/** DELETE /api/requests/:id — Permanently remove a blood request */
export async function deleteRequest(id) {
    const { data } = await api.delete(`/requests/${id}`);
    return data;
}
