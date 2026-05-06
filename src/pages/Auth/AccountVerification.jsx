import { useState, useEffect } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import { verifyUserAPI } from '~/apis'

function AccountVerification() {

  let [searchParams] = useSearchParams()

  // get date from URL
  const { email, token } = Object.fromEntries([...searchParams])

  const [verified, setVerified] = useState(false)

  // Call API to verify account
  useEffect(() => {
    if (email && token) {
      verifyUserAPI({ email, token })
        .then( () => {
          setVerified(true)
        })
    }
  }, [email, token])

  if (!email || !token) {
    return <Navigate to="/404" />
  }

  if (!verified) {
    return <PageLoadingSpinner alert="verifying your account..." />
  }

  return <Navigate to={`/login?verifiedEmail=${email}`} />
}

export default AccountVerification
