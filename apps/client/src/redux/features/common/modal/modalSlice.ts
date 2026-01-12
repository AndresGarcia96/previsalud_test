import { ItemKeys } from "@/components/common/custom_dashboard_layout_admins/enums/item_names_and_keys.enums";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isPageLoading: false,
  passwordResetToken: "",
  collaboratorModalIsOpen: false,
  adminModalIsOpen: false,
  userModalIsOpen: false,
  firstSuccessLoginModalIsOpen: false,
  changePasswordExpiryModalIsOpen: false,
  selectedKey: ItemKeys.ITEM_HOMEPAGE_KEY,
  tableRowId: "",
  selectedOpenKeys: [""],
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setIsPageLoading: (state, action) => {
      state.isPageLoading = action.payload;
    },
    setPasswordResetToken: (state, action) => {
      state.passwordResetToken = action.payload;
    },
    setSelectedKey: (state, action) => {
      state.selectedKey = action.payload;
    },
    setSelectedOpenKeys: (state, action) => {
      state.selectedOpenKeys = action.payload;
    },
    setCollaboratorModalIsOpen: (state, action) => {
      state.collaboratorModalIsOpen = action.payload;
    },
    setUserModalIsOpen: (state, action) => {
      state.userModalIsOpen = action.payload;
    },
    setAdminModalIsOpen: (state, action) => {
      state.adminModalIsOpen = action.payload;
    },
    setFirstLoginModalIsOpen: (state, action) => {
      state.firstSuccessLoginModalIsOpen = action.payload;
    },
    setChangePasswordExpiryModalIsOpen: (state, action) => {
      state.changePasswordExpiryModalIsOpen = action.payload;
    },
    setTableRowId: (state, action) => {
      state.tableRowId = action.payload;
    },
    setResetModalAdmin: (state) => {
      state.selectedKey = ItemKeys.ITEM_HOMEPAGE_KEY;
      state.selectedOpenKeys = [""];
      state.firstSuccessLoginModalIsOpen = false;
      state.collaboratorModalIsOpen = false;
      state.adminModalIsOpen = false;
    },
  },
});

export const {
  setIsPageLoading,
  setPasswordResetToken,
  setSelectedKey,
  setSelectedOpenKeys,
  setResetModalAdmin,
  setCollaboratorModalIsOpen,
  setUserModalIsOpen,
  setAdminModalIsOpen,
  setFirstLoginModalIsOpen,
  setTableRowId,
  setChangePasswordExpiryModalIsOpen,
} = modalSlice.actions;

export default modalSlice.reducer;
