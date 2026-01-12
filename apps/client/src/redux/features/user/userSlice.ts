import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "@/utils/interfaces/user.interface";

const initialState: IUser = {
  id: "",
  name: "",
  last_name: "",
  id_type: null,
  id_number: "",
  birthdate: "",
  email: "",
  cellphone: 0,
  password: "",
  verification_code: null,
  role: [],
  residence_department: "",
  residence_city: "",
  residence_address: "",
  residence_neighborhood: "",
  is_active: true,
  transactions: [],
  createdAt: "",
  updatedAt: "",
  deletedAt: "",
  errors: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setStateUser: (
      state,
      action: PayloadAction<{
        field?: keyof IUser;
        value?: any;
        fieldValues?: Partial<IUser>;
      }>
    ) => {
      if (action.payload.fieldValues) {
        Object.assign(state, action.payload.fieldValues);
      } else if (action.payload.field) {
        (state as any)[action.payload.field] = action.payload.value;
      }
    },

    setAllUserState: (state, action: PayloadAction<IUser>) => {
      return { ...action.payload };
    },

    resetUser: () => {
      return { ...initialState };
    },
  },
});

export const { setStateUser, setAllUserState, resetUser } = userSlice.actions;

export default userSlice.reducer;
