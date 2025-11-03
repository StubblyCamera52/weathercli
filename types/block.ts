export interface block {
  name: string;
  width: number; // if 0 it will auto expand to max width
  height: number; // if 0 it will also auto expand to max width
  border: "none" | "dashed"
  
};