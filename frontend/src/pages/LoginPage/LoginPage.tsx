
import React,{ useState } from 'react';
import Button from 'react-bootstrap/Button';
import { Link,useNavigate } from 'react-router-dom';
import axios, { AxiosError,HttpStatusCode } from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AUTH_LOGIN_URL } from '../../utils/constants';
import { allowCorsForAxios } from '../../utils/allowCorsForAxios';
import AuthTokens from '../../interfaces/AuthTokens';
import { saveTokens } from '../../services/auth.service';
import LoginFormData from '../../interfaces/LoginFormData';
import isEmailValidCheck from '../../utils/isEmailValidCheck';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { AUTH_GOOGLE_LOGIN_URL } from '../../utils/constants';


const LoginPage = () => {
  const navigate = useNavigate();

  const [loginFormData,setLoginFormData] = useState<LoginFormData>({ email: '', password: '' });

  const handleInputChange = (fieldName:string, value:string) => {
    setLoginFormData({ ...loginFormData, [fieldName]: value });
  };

  const isInputValidCheck = (email:string, password:string) => {
    if(!email || !password) {
      toast.error('Please fill in all fields');
      return false;
    }
    const isEmailValid = isEmailValidCheck(email);
    if(!isEmailValid) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  }
  
    const onGoogleLoginSuccess = async(credentialResponse: CredentialResponse) => {
    try {
      allowCorsForAxios(axios);
      const credential = credentialResponse.credential;
      const tokens = await axios.post(AUTH_GOOGLE_LOGIN_URL, {credential});
      if(!tokens){
        console.log('no tokens received');
        return;
      }
      saveTokens(tokens.data as AuthTokens);
      toast.success('Logged in with Google successfully');
      toast.info(`You've been given a random password, Please change it after logging in.`);
      navigate('/');
    } catch (error) {
      console.log('error response', error);
    }
  };

  const onGoogleLoginFailure = () => {
    console.log('google login failure');
    toast.error('Failed to login with Google');
  };
  
  const handleLoginSubmit =async (e: React.FormEvent<HTMLFormElement>) => {
    try{
      e.preventDefault();
      const { email, password } = loginFormData;
      const isInputValid = isInputValidCheck(email, password);
      if(!isInputValid) return;
      allowCorsForAxios(axios)
      const tokens = await axios.post(AUTH_LOGIN_URL, {email, password})
      saveTokens(tokens.data as AuthTokens);
      setLoginFormData({ email: '', password: '' });
      toast.success('Logged in successfully');
      navigate('/');
    } catch(err) {
        const error = err as AxiosError;
        const errorStatusCode = error.response?.status;
        console.log('error response', error.response);
        if(errorStatusCode === HttpStatusCode.BadRequest) {
          toast.error('Please fill in all fields');
        } else if(errorStatusCode === HttpStatusCode.Unauthorized) {
          toast.error('user was not found or password is incorrect');
        } else if(errorStatusCode === HttpStatusCode.InternalServerError) {
          toast.error('server error occurred, please try again later');
        }
    }
}

return (
  <>
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          <Box component="form" noValidate onSubmit={handleLoginSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={loginFormData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={loginFormData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="contained"
              
            >
              Login
            </Button>
            <GoogleLogin onSuccess={onGoogleLoginSuccess} onError={onGoogleLoginFailure}></GoogleLogin>
            <Grid container>
              <Grid item>
                <Link to="/signup">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Grid>
  <ToastContainer />
  </>
);
}

export default LoginPage;