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
