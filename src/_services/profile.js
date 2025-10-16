// src/_services/profile.js
import api from "../_api";

export const updateMyProfile = (formData) => {
  return api.post("/me/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Note: backend expects keys: old_password, new_password, new_password_confirmation
export const changeMyPassword = (payload) => {
  // payload: { old_password, new_password, new_password_confirmation }
  return api.post("/me/password", payload);
};

export default {
  updateMyProfile,
  changeMyPassword,
};
