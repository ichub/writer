interface IHeaderFooter {
  contents: string;
  height: string;
}

interface IPrintInfo {
  header: IHeaderFooter;
  footer: IHeaderFooter;
}

interface IMetadata {
  name: {
    first: string,
    last: string,
    full: string
  };
  courses: [{
    period: number;
    teacher: string;
    name: string;
  }];
}