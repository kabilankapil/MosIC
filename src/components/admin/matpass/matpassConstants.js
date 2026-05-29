// src/components/admin/matpass/matpassConstants.js
//
// Static constants and empty-form factories for Matpass sub-components.
// No React or API imports — purely data.

import { localDate } from "../shared/adminStyles";

export const RETURN_OPTIONS = ["NON-RETURN", "RETURN"];

export const emptyForm = () => ({
  inOrOut:       "IN",
  party:         "",
  date:          localDate(),
  quantity:      "",
  contactPerson: "",
  discription:   "",
  fileRef:       "",
  status:        1,
});

export const emptyStockRow = () => ({
  _key:       `${Date.now()}-${Math.random()}`,
  id:         null,          // null = new row; number = existing movement
  stockItemId: "",
  quantity:   "",
  remarks:    "",
  returnType: "NON-RETURN",
  deleted:    false,
});
