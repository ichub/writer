class HelperInfo {
  private _name:string;

  private static data:{[key: string]:any} = {};

  constructor(name:string) {
    this._name = name;
  }

  getData():any {
    return HelperInfo.data[this._name];
  }

  setData(data:any):void {
    HelperInfo.data[this._name] = data;
  }

  public get name() {
    return this._name;
  }
}

export class InputHelperInfo extends HelperInfo {
  getData():any {
    return super.getData();
  }

  setData(data:any):any {
    super.setData(data);
  }
}

export class OutputHelperInfo extends HelperInfo {
  getData():any {
    throw new Error('The helper\"' + this.name + '\" does not provide data because it is an output helper');
  }

  setData(data:any) {
    throw new Error('The data of helper\"' + this.name + '\" cannot be set because it is an output helper');
  }
}