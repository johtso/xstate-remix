import { StateFrom } from "xstate";
import { bookingMachine, BookingMachineState } from "./machines/booking.machine";

export type LoaderData = {
  machineState: BookingMachineState;
  performance: PerformanceType;
};

export type PerformanceType = {
  id: string;
  title: string;
};
