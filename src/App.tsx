import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';
import ErrorBoundary from 'components/ErrorBoundary';
// auth-provider
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <ScrollTop>
              <AuthProvider>
                <>
                  <Notistack>
                    <RouterProvider router={router} />
                    <Snackbar />
                  </Notistack>
                </>
              </AuthProvider>
            </ScrollTop>
          </Locales>
        </RTLLayout>
      </ThemeCustomization>
    </ErrorBoundary>
  );
}
