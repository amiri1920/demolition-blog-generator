declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      [key: string]: any;
    };
    jsPDF?: {
      unit?: string;
      format?: string | number[];
      orientation?: 'portrait' | 'landscape';
      [key: string]: any;
    };
    pagebreak?: {
      mode?: string | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
    enableLinks?: boolean;
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: HTMLElement | string): Html2Pdf;
    save(): Promise<void>;
    output(type: string, options?: any): Promise<any>;
    then(callback: (pdf: any) => void): Html2Pdf;
    catch(callback: (error: any) => void): Html2Pdf;
    toPdf(): Html2Pdf;
    get(type: string): Promise<any>;
  }

  function html2pdf(): Html2Pdf;
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Promise<void>;

  export = html2pdf;
}