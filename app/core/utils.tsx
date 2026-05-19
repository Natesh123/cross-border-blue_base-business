export const emailValidator = (email: string) => {
  const re = /\S+@\S+\.\S+/;

  if (!email || email.length <= 0) return 'Email cannot be empty.';
  if (!re.test(email)) return 'Ooops! We need a valid email address.';

  return '';
};

export const passwordValidator = (password: string) => {
  if (!password || password.trim().length === 0) {
    return 'Password cannot be empty.';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }

  // Example of checking for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }

  // Example of checking for at least one digit
  if (!/\d/.test(password)) {
    return 'Password must contain at least one digit.';
  }

  // Example of checking for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character.';
  }

  // If all checks pass
  return '';
};


export const confirmPasswordValidator = (password: string, confirmPassword: string) => {
  if (!password || password.length <= 0) return '';
  if (!confirmPassword || confirmPassword.length <= 0) return '';
  if(password !== confirmPassword)  return 'Passwords and Confirm password are not same';
  return '';
};

export const nameValidator = (name: string) => {
  if (!name || name.length <= 0) return 'Name cannot be empty.';

  return '';
};

export const MPINValidator = (PIN: string) => {
  if (!PIN || PIN.length <= 4) return 'MPIN cannot be empty.';

  return '';
};
