export const validateEmail = (email: string): string | null => {
  if (!email) {
    return "Email không được để trống";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Email không hợp lệ";
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return null;
  if (!/^[0-9]{10,11}$/.test(phone.replace(/[\s-]/g, ""))) {
    return "Số điện thoại không hợp lệ (10-11 số)";
  }
  return null;
};

export const validateRequired = (
  value: string,
  fieldName: string,
): string | null => {
  if (!value || value.trim() === "") {
    return `${fieldName} không được để trống`;
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Mật khẩu không được để trống";
  }
  if (password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự";
  }
  return null;
};
