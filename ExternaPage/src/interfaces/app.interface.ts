
export interface IPermission {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
};
 
export interface IRole { 
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  permissions: IPermission[];
};


export interface IUser {
  id: string
  email: string
  password: string
  name: string
  avatar?: string;
  role: IRole[];
};

export interface ICategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
};

export interface IStatus {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
};

export interface ITab {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
};


//App
export interface CardType {
  id: string
  name: string
  fee: number
  days: number
}

export interface Machine {
  id: string
  name: string
}

export interface Sale {
  id: string
  date: string
  amount: number
  cardTypeId: string
  machineId: string
  fee: number
  netAmount: number
  expectedDate: string
}

export interface PaymentStatus {
  [key: string]: boolean
}

export interface MachineCardFee {
  id: string
  machineId: string
  cardTypeId: string
  fee: number
}