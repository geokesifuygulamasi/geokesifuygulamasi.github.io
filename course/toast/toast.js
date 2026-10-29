
const toastContainer = document.createElement("div");
toastContainer.className = "toast-container";
toastContainer.setAttribute("aria-live", "polite");
toastContainer.setAttribute("aria-atomic", "false");

document.body.append(toastContainer);

/**
 * @param {string} message
 * @param {"success" | "error" | "warning" | "info"} type
 * @param {number} duration
 */
export function notify(message, type = "info", duration = 3000) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    // Metni güvenli şekilde ekle.
    toast.textContent = message;
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    toastContainer.append(toast);

    let removed = false;

    function removeToast() {
        if (removed) return;
        removed = true;

        clearTimeout(timer);

        toast.classList.add("removing");
        toast.addEventListener("animationend", () => toast.remove(), {
            once: true
        });

        // Animasyon kapalıysa veya animationend oluşmazsa da sil.
        setTimeout(() => toast.remove(), 250);
    }

    const timer = setTimeout(removeToast, Math.max(0, duration));

    // İstersen üzerine tıklayarak kapat.
    toast.addEventListener("click", removeToast);

    return toast;
}
