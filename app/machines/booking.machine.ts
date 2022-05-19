import { createMachine, assign, StateFrom } from 'xstate';

const TicketTypes = ["ADULT", "CHILD"]
type TicketType = typeof TicketTypes[number]

export type BookingMachineState = StateFrom<typeof bookingMachine>;

export const bookingMachine = 
/** @xstate-layout N4IgpgJg5mDOIC5QCMD2qDWBLAdlAsgIYDGAFrmAHSxiEAusAxAMIDyAcgGICSASvgH0AygFEAggBUhiUAAdUsLHSyocMkAA9EAWgDMABgAslXQEZ9uswFYATAE47VgBymrAGhABPHQDYrlAHZDGwCbIysgq10fOwBfWI80TFwCEnIcKmViDDAGRgBVUQEANVZ85gAJEV5pJBB5RWVVdS0EbVNdYyd9U2DouwCfaKMPbwQfSkN9PyCbDt07EP04hJAk7DwiMgpKLJy8gAUxAE11BqUVNTrW7RtnE0NXO1NTRZshw1HEAKdKO6ddFZXj4Qj4XCtEugNqlthlKLIwAAnDBMI6nOrnJpXUCtAL6ShGUw+fRGSxDHx+L4IVymQL6Fwhex2JxhCzxVY4VAQODqdYpLbpKg0ejwDEKC7Na46GwsyggmWGQwsgLOEFU9q6AKTUw2MJzAIdAaGeKQ5KbNI7Pa5UVycVYlrSpxa+mDOwuwEBRw+dX45adMIg6a6mV3UwmtZQ-kWuEI5E2+p2y4OhCKyiLfRWCy2CmGCJ2H0Euz+oNB3VOYkBcN882wqiIuAAVwANnQzonJTjHbo0yEouYAYszFTev4wi5DCDHoMgVXIzXBW3GkmpW1dDKTOZLK4mc5XOq5vjHnNngPggFdE52bEgA */
createMachine({
  id: "bookingMachine",
  tsTypes: {} as import("./booking.machine.typegen").Typegen0,
  schema: {
    context: {} as {
      seats: boolean[];
      tickets: {[key: TicketType]: number};
    },
    events: {} as
      | { type: "SEAT_SELECTION"; selections: string[] }
      | { type: "CONFIRM_SEATS"; }
      | { type: "USE_VOUCHERS"; }
      | { type: "PAY"; }
  },
  initial: "seats",
  context: {
    seats: [false, false, false, false, false],
    tickets: {},
  },
  states: {
    seats: {
      on: {
        SEAT_SELECTION: {
          actions: "storeSeatSelection"
        },
        CONFIRM_SEATS: {
          target: "tickets",
        },
      },
    },
    tickets: {
      on: {
        USE_VOUCHERS: {
          target: "perks",
        },
        PAY: {
          target: "result",
        },
      },
    },
    perks: {
      on: {
        PAY: {
          target: "result",
        },
      },
    },
    result: {},
  },
},
{
  actions: {
    storeSeatSelection: assign({
      seats: (ctx, event) => {
        // create a new array
        // iterate over ctx.seats
        // if event.selections contains the index, set the value to true in the new array
        // else set the value to false
        // return the new array
        return ctx.seats.map((_, index) => event.selections.includes(index.toString()));
      },
    })
  }
});