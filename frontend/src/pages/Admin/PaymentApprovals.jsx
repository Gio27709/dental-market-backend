import { useEffect, useState } from "react";
import { useOrder } from "../../context/OrderContext";
import PaymentApprovalQueue from "../../components/admin/PaymentApprovalQueue";
import PaymentProofViewer from "../../components/admin/PaymentProofViewer";
import toast from "react-hot-toast";

export default function PaymentApprovals() {
  const { orders, fetchOrders, approvePayment, rejectPayment, loading } =
    useOrder();

  // Modal states
  const [activeProofUrl, setActiveProofUrl] = useState(null);

  // Rejection logic states
  const [rejectingOrderId, setRejectingOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    // Only fetch orders that are awaiting payment validation
    // Optionally filters could be driven by the backend query
    fetchOrders({ payment_status: "pending_approval" });
  }, [fetchOrders]);

  const handleViewProof = (url) => {
    setActiveProofUrl(url);
  };

  const handleCloseViewer = () => {
    setActiveProofUrl(null);
  };

  const handleApprove = async (orderId) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas APROBAR este pago de Escrow y enviar la orden?",
      )
    )
      return;

    const res = await approvePayment(orderId);
    if (res.success) {
      toast.success(
        `Pago de la orden ${orderId.split("-")[0].toUpperCase()} aprobado con éxito.`,
      );
      fetchOrders({ payment_status: "pending_approval" }); // Refresh queue
    } else {
      toast.error(res.error || "No se pudo aprobar la orden.");
    }
  };

  const initReject = (orderId) => {
    setRejectingOrderId(orderId);
    setRejectionReason("");
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error(
        "Debes suministrar un motivo para rechazar el pago (Ej. Transferencia no refleja).",
      );
      return;
    }

    const res = await rejectPayment(rejectingOrderId, rejectionReason);
    if (res.success) {
      toast.success(`Orden rechazada: ${rejectionReason}`);
      setRejectingOrderId(null);
      fetchOrders({ payment_status: "pending_approval" }); // Refresh queue
    } else {
      toast.error(res.error || "Error al rechazar pago");
    }
  };

  const cancelReject = () => {
    setRejectingOrderId(null);
    setRejectionReason("");
  };

  // Filter orders manually on frontend just in case backend ignores param temporarily
  const pendingOrders = orders.filter(
    (o) => o.payment_status === "pending_approval",
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center gap-3">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              ></path>
            </svg>
            Panel de Aprobación Escrow
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Valida depósitos y transferencias antes de liberar despachos para
            garantizar ventas 100% seguras.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => fetchOrders({ payment_status: "pending_approval" })}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Actualizando..." : "Refrescar Cola"}
          </button>
        </div>
      </div>

      {loading && !pendingOrders.length ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <PaymentApprovalQueue
          orders={pendingOrders}
          onViewProof={handleViewProof}
          onApprove={handleApprove}
          onReject={initReject}
        />
      )}

      {/* Proof Viewer Overlay */}
      {activeProofUrl && (
        <PaymentProofViewer
          proofUrl={activeProofUrl}
          onClose={handleCloseViewer}
        />
      )}

      {/* Rejection Modal */}
      {rejectingOrderId && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={cancelReject}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Rechazar Pago de Orden
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2">
                        Por favor, especifica el motivo por el cual se rechaza
                        el pago recibido. Esto se enviará al cliente.
                      </p>
                      <textarea
                        rows="3"
                        className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Ej. La referencia enviada no concuerda con nuestro estado de cuenta."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmReject}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirmar Rechazo
                </button>
                <button
                  type="button"
                  onClick={cancelReject}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
