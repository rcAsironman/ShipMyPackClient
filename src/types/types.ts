export interface paymentInfoType {
    upiId: string | null,
    bankName: string | null,
    bankaccountNumber: string | null,
    ifscCode: string | null
  }


export interface paymentDetails {
    id: number,
    icon: any,
    label: string,
    method: () => void
  }