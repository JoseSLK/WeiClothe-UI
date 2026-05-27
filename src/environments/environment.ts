export const environment = {
    production: false,
    name: 'weiclothe',
    apiUrl: 'http://localhost:8000/', //Go
    mlApiUrl: 'http://localhost:5000/', //Python
    keycloakUrl: 'http://localhost:9090', //Keycloak-Python
    tenantName: 'WeiClothe',
    logoUrl: '/logo-weiclothe.png',
    faviconUrl: '/wei.ico',
    theme: {
        '--bg-color': '#0f0f11',
        '--surface-color': '#1a1a1e',
        '--primary-color': '#f8f8f9',
        '--primary-hover': '#e2e2e4',
        '--text-main': '#ffffff',
        '--text-muted': '#8e8e93',
        '--border-color': '#2c2c30',
        '--input-bg': '#141416',
        '--error-color': '#ff453a',
        '--error-bg': 'rgba(255, 69, 58, 0.1)',
        '--border-radius': '12px',
        '--font-family': "'Inter', sans-serif"
    }
};