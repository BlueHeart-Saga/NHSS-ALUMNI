import Swal from 'sweetalert2';

// Brand-Matched SweetAlert2 Base Configuration
const BrandSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-2xl border border-[#E5E7EB] shadow-2xl p-6 font-normal text-[#111111] bg-white',
    title: 'text-xl sm:text-2xl font-medium text-[#111111] tracking-tight leading-snug',
    htmlContainer: 'text-xs sm:text-sm text-gray-600 font-normal leading-relaxed mt-2',
    confirmButton: 'px-5 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-sm rounded-xl shadow-xs transition-all border border-[#E0B030] mx-1.5 focus:ring-2 focus:ring-[#F4C542]/50 outline-none cursor-pointer',
    cancelButton: 'px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-xl transition-all border border-gray-200 mx-1.5 focus:ring-2 focus:ring-gray-300 outline-none cursor-pointer',
    actions: 'mt-6 flex items-center justify-center space-x-2',
    icon: 'border-0 scale-95 mb-2'
  },
  buttonsStyling: false,
  background: '#FFFFFF',
  color: '#111111'
});

export const alertService = {
  /**
   * Display Success Alert (After confirmed backend persistence)
   */
  showSuccess: (title: string, text?: string) => {
    return BrandSwal.fire({
      icon: 'success',
      title: title,
      text: text,
      confirmButtonText: 'OK',
      iconColor: '#10B981',
      timer: 3500,
      timerProgressBar: true
    });
  },

  /**
   * Display Error Alert
   */
  showError: (title: string, text?: string) => {
    return BrandSwal.fire({
      icon: 'error',
      title: title,
      text: text || 'Something went wrong. Please try again.',
      confirmButtonText: 'OK',
      iconColor: '#EF4444'
    });
  },

  /**
   * Display Warning Alert
   */
  showWarning: (title: string, text?: string) => {
    return BrandSwal.fire({
      icon: 'warning',
      title: title,
      text: text || 'This action cannot be undone.',
      confirmButtonText: 'Proceed',
      iconColor: '#F59E0B'
    });
  },

  /**
   * Display Information Alert
   */
  showInfo: (title: string, text?: string) => {
    return BrandSwal.fire({
      icon: 'info',
      title: title,
      text: text,
      confirmButtonText: 'Got It',
      iconColor: '#3B82F6'
    });
  },

    /**
   * Open a large lightbox preview of a profile photo WITH inline
   * Upload/Replace, Remove, and Close actions.
   *
   * Returns a promise resolving to:
   *   'upload'  → admin chose to upload/replace the photo
   *   'remove'  → admin chose to remove the photo
   *   'close'   → admin dismissed the popup (backdrop / ESC / Close button)
   */
  showImagePreview: (
    imageUrl: string | undefined,
    title?: string,
    options: {
      canRemove?: boolean;
      isPlaceholder?: boolean;
    } = {}
  ): Promise<'upload' | 'remove' | 'close'> => {
    const { canRemove = false, isPlaceholder = false } = options;

    // We track the chosen action outside the Swal promise because
    // SweetAlert2 has no native "custom button returns value" API.
    let choice: 'upload' | 'remove' | 'close' = 'close';

    const photoBlock = imageUrl
      ? `<img
           src="${imageUrl}"
           alt="${title || 'Profile Photo'}"
           style="
             display:block;
             max-height:60vh;
             max-width:min(80vw, 500px);
             width:auto;
             height:auto;
             border-radius:12px;
             object-fit:contain;
             margin:0 auto;
             background:#F9FAFB;
           "
         />`
      : `<div style="
           width:180px;height:180px;border-radius:12px;
           background:#F3F4F6;border:1px dashed #D1D5DB;
           display:flex;align-items:center;justify-content:center;
           color:#9CA3AF;font-size:13px;font-weight:600;margin:0 auto;
         ">No Photo</div>`;

    return BrandSwal.fire({
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:14px;">
          <div style="max-width:100%;">${photoBlock}</div>

          ${title ? `<div style="
            font-size:15px;font-weight:700;color:#111111;
            text-align:center;line-height:1.3;
          ">${title}</div>` : ''}

          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
            <button id="swal-upload-btn" type="button" style="
              padding:8px 16px;border-radius:12px;font-size:13px;font-weight:700;
              background:#FFF7D6;color:#854D0E;border:1px solid #F4C542;
              cursor:pointer;display:inline-flex;align-items:center;gap:6px;
              transition:all .15s;
            " onmouseover="this.style.background='#FEF0B8'" onmouseout="this.style.background='#FFF7D6'">
              ⬆ ${isPlaceholder ? 'Upload Photo' : 'Replace Photo'}
            </button>

            ${
              canRemove
                ? `<button id="swal-remove-btn" type="button" style="
                    padding:8px 16px;border-radius:12px;font-size:13px;font-weight:700;
                    background:#FEE2E2;color:#991B1B;border:1px solid #FCA5A5;
                    cursor:pointer;display:inline-flex;align-items:center;gap:6px;
                    transition:all .15s;
                  " onmouseover="this.style.background='#FECACA'" onmouseout="this.style.background='#FEE2E2'">
                    🗑 Remove
                  </button>`
                : ''
            }
          </div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Close',
      width: 'auto',
      padding: '1.25rem',
      customClass: {
        popup: 'rounded-2xl border border-[#E5E7EB] shadow-2xl font-normal text-[#111111] bg-white max-w-[92vw]',
        htmlContainer: 'm-0 p-0',
        confirmButton: 'px-5 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-medium text-sm rounded-xl shadow-xs transition-all border border-[#E0B030] mt-2 focus:ring-2 focus:ring-[#F4C542]/50 outline-none cursor-pointer',
        actions: 'mt-3',
      },
      background: '#FFFFFF',
      color: '#111111',
      didOpen: (popup) => {
        const uploadBtn = popup.querySelector('#swal-upload-btn') as HTMLButtonElement | null;
        if (uploadBtn) {
          uploadBtn.onclick = () => {
            choice = 'upload';
            Swal.close();
          };
        }
        const removeBtn = popup.querySelector('#swal-remove-btn') as HTMLButtonElement | null;
        if (removeBtn) {
          removeBtn.onclick = () => {
            choice = 'remove';
            Swal.close();
          };
        }
      },
    }).then(() => choice);
  },

  /**
   * Display Confirmation Dialog (Returns Promise<boolean>)
   */
  showConfirm: async (
    title: string,
    text: string,
    confirmButtonText: string = 'Confirm',
    cancelButtonText: string = 'Cancel'
  ): Promise<boolean> => {
    const result = await BrandSwal.fire({
      icon: 'warning',
      title: title,
      text: text,
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      iconColor: '#F4C542',
      reverseButtons: true
    });
    return result.isConfirmed;
  },

  /**
   * Display Confirmation Dialog with HTML (Returns Promise<boolean>)
   */
  showConfirmHtml: async (
    title: string,
    html: string,
    confirmButtonText: string = 'Confirm',
    cancelButtonText: string = 'Cancel'
  ): Promise<boolean> => {
    const result = await BrandSwal.fire({
      icon: 'info',
      title: title,
      html: html,
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      iconColor: '#F4C542',
      reverseButtons: true
    });
    return result.isConfirmed;
  },

  /**
   * Display Loading Indicator (Processing API Action)
   */
  showLoading: (title: string = 'Processing...', text: string = 'Please wait while we complete your request.') => {
    BrandSwal.fire({
      title: title,
      text: text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  /**
   * Close Active Loading Modal
   */
  closeLoading: () => {
    Swal.close();
  },

  /**
   * Centralized HTTP API Error Handler with friendly user messages
   */
  handleApiError: (err: any, fallbackMessage: string = 'Unable to complete action. Please try again.') => {
    let errorTitle = 'Action Failed';
    let errorMessage = fallbackMessage;

    if (err) {
      const msg = typeof err === 'string' ? err : err.message || '';
      const status = err.status || err.statusCode;

      if (status === 401 || msg.includes('401') || msg.toLowerCase().includes('session expired') || msg.toLowerCase().includes('token expired')) {
        errorTitle = 'Session Expired';
        errorMessage = 'Your session has expired. Please login again to continue.';
      } else if (status === 403 || msg.includes('403') || msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('access denied')) {
        errorTitle = 'Access Denied';
        errorMessage = "You don't have permission to perform this action. Please contact administrator.";
      } else if (status === 404 || msg.includes('404') || msg.toLowerCase().includes('not found')) {
        errorTitle = 'Item Not Found';
        errorMessage = 'The requested item could not be found or has been removed.';
      } else if (status === 409 || msg.includes('409') || msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('conflict')) {
        errorTitle = 'Conflict Detected';
        errorMessage = msg.replace(/^HTTP \d+:\s?/, '') || 'This record already exists or conflicts with existing data.';
      } else if (status === 422 || msg.includes('422') || msg.toLowerCase().includes('validation')) {
        errorTitle = 'Invalid Details';
        errorMessage = 'Please check the information you entered and try again.';
      } else if (status === 500 || msg.includes('500') || msg.toLowerCase().includes('internal server')) {
        errorTitle = 'Server Error';
        errorMessage = 'Something went wrong on the server. Please try again in a few moments.';
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('failed to fetch')) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (msg) {
        errorMessage = msg;
      }
    }

    return BrandSwal.fire({
      icon: 'error',
      title: errorTitle,
      text: errorMessage,
      confirmButtonText: 'OK',
      iconColor: '#EF4444'
    });
  }
};