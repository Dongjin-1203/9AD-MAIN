export type SignUpForm = {
  type:                 'enlisted' | 'nco';
  sn:                   string;
  name:                 string;
  unit:                 'headquarters' | 'security' | 'ammunition' | 'staff' | null;
  password:             string;
  passwordConfirmation: string;
};
