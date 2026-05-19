 
class ReceivingModeOption {
 
    key: string = '';
 
    text: string = '';

}

export class ReceivingModeField { 
    
    key: string = '';
 
    label: string = '';
 
    type: string = '';
 
    url: string = '';
 
    required?: boolean; 

    maxlength: number = 0;

   optionMetas: ReceivingModeOption[] = [];

    receivingModeOptions: any[] = [];

}
