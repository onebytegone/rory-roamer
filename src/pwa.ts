import { registerSW } from 'virtual:pwa-register';

export function initPWA(app: Element) {

   const pwaToast = app.querySelector<HTMLDivElement>('#pwa-toast')!;
   const pwaToastMessage = pwaToast.querySelector<HTMLDivElement>('.message #toast-message')!;
   const pwaCloseBtn = pwaToast.querySelector<HTMLButtonElement>('#pwa-close')!;
   const pwaRefreshBtn = pwaToast.querySelector<HTMLButtonElement>('#pwa-refresh')!;

   let refreshSW: (reloadPage?: boolean) => Promise<void> | undefined;

   const refreshCallback = () => refreshSW?.(true);

   function hidePwaToast (raf: boolean): void {
      if (raf) {
         requestAnimationFrame(() => hidePwaToast(false));
         return;
      }

      if (pwaToast.classList.contains('refresh')) {
         pwaRefreshBtn.removeEventListener('click', refreshCallback);
      }

      pwaToast.classList.remove('show', 'refresh');
   }

   function showPwaToast(offline: boolean): void {
      if (!offline) {
         pwaRefreshBtn.addEventListener('click', refreshCallback);
      }

      requestAnimationFrame(() => {
         hidePwaToast(false)
         if (!offline) {
            pwaToast.classList.add('refresh');
         }

         pwaToast.classList.add('show');
      });
   }

   let swActivated = false;
   const period = 0;

   window.addEventListener('load', () => {
      pwaCloseBtn.addEventListener('click', () => hidePwaToast(true));
      refreshSW = registerSW({
         immediate: true,
         onOfflineReady() {
            pwaToastMessage.innerHTML = 'App ready to work offline';
            showPwaToast(true);
         },
         onNeedRefresh() {
            pwaToastMessage.innerHTML = 'New content available, click on reload button to update';
            showPwaToast(false);
         },
         onRegisteredSW(swUrl, r) {
            if (period <= 0) return
            if (r?.active?.state === 'activated') {
               swActivated = true;
               registerPeriodicSync(period, swUrl, r);
            } else if (r?.installing) {
               r.installing.addEventListener('statechange', (e) => {
                  const sw = e.target as ServiceWorker;
                  swActivated = sw.state === 'activated';
                  if (swActivated)
                     registerPeriodicSync(period, swUrl, r)
               });
            }
         },
      });
   });
}

function registerPeriodicSync(period: number, swUrl: string, r: ServiceWorkerRegistration): void {
   if (period <= 0) {
      return;
   }

   setInterval(async () => {
      if ('onLine' in navigator && !navigator.onLine) {
         return;
      }

      const resp = await fetch(swUrl, {
         cache: 'no-store',
         headers: {
            'cache': 'no-store',
            'cache-control': 'no-cache',
         },
      });

      if (resp?.status === 200) {
         await r.update();
      }
   }, period);
}
