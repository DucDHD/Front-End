let apiROOT = ''

if (process.env.BUILD_MODE === 'dev') {
  apiROOT = 'http://localhost:8017'
}

if (process.env.BUILD_MODE === 'production') {
  apiROOT = 'https://back-end-6lug.onrender.com'
}

export const API_ROOT = apiROOT