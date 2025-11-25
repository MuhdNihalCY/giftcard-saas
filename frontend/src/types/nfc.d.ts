// Web NFC API type definitions
interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  data: ArrayBuffer | DataView;
}

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFReader extends EventTarget {
  scan(): Promise<void>;
  write(message: NDEFMessage): Promise<void>;
  abort(): void;
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((error: Event) => void) | null;
}

interface NDEFReadingEvent extends Event {
  message: NDEFMessage;
  serialNumber?: string;
}

declare var NDEFReader: {
  prototype: NDEFReader;
  new (): NDEFReader;
};

interface Window {
  NDEFReader: typeof NDEFReader;
}


