import { createMachine, assign, StateFrom, ContextFrom } from 'xstate';
import { z } from 'zod';

const coerceToNumber = (a: unknown) => {
  if (typeof a === 'number') {
    return a;
  } else if (typeof a === 'string') {
    return parseInt(a as string, 10);
  } else {
    throw new Error(`Expected string or number, got ${typeof a}`);
  }
}


const TicketTypes = ["ADULT"] as const;
// const TicketTypes = ["ADULT", "CHILD"] as const;
type TicketType = typeof TicketTypes[number];

export type BookingMachineState = StateFrom<typeof bookingMachine>;

export const NavigablePaths = ["seats", "tickets", "perks"] as const;
export type NavigablePathType = typeof NavigablePaths[number];
type NavigationEventName = `NAVIGATION.${Uppercase<NavigablePathType>}`;

export type NavigationEvent = { type: NavigationEventName }

export function eventFromPath(path: NavigablePathType): NavigationEvent {
  return { type: `NAVIGATION.${path.toUpperCase() as Uppercase<NavigablePathType>}` };
}

type TicketChoiceType = { [key in TicketType]: number };


const ticketSelection = z.object(
  Object.fromEntries(
    TicketTypes.map(t => [
      t,
      z.preprocess(
        coerceToNumber,
        z.number()
      )
    ])
  ) as { [key in TicketType]: z.ZodEffects<z.ZodNumber, number, number> }
);

export const zBookingMachineEvent = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("UPDATE_TICKET_SELECTION"),
    tickets: ticketSelection,
  }),
  z.object({
    type: z.literal("UPDATE_SEAT_SELECTION"),
    selections: z.array(z.string()).default([]),
  }),
]);

type BookingMachineEvent = z.infer<typeof zBookingMachineEvent>;

export type Context = {
  seats: boolean[];
  tickets: TicketChoiceType;
}


export const totalTickets = (ctx: Context) => {
  return Object.values(ctx.tickets).reduce((a, b) => a + b, 0);
}

export const totalSeats = (ctx: Context) => {
  return ctx.seats.filter(s => s).length;
}

export const validSelections = (ctx: Context) => {
  const ticketCount = totalTickets(ctx);
  const seatCount = totalSeats(ctx);
  return seatCount !== 0 && ticketCount === seatCount;
}

export const bookingMachine = 
/** @xstate-layout N4IgpgJg5mDOIC5QCMD2qDWBLAdlAsgIYDGAFrmAHSxiEAusAxAMIDyAcgGICSASvgH0AygFEAggBUhiUAAdUsLHSyocMkAA9EAWgDMABgAslXQEZ9uswFYATAE47VgBymrAGhABPHQDYrlAHZDGwCbIysgq10fOwBfWI80TFwCEnIcKmViDDAGRgBVUQEANVZ85gAJEV5pJBB5RWVVdS0EbVNdYyd9U2DouwCfaKMPbwQfSkN9PyCbDt07EP04hJAk7DwiMgpKLJy8gAUxAE11BqUVNTrW7RtnE0NXO1NTRZshw1HEAKdKO6ddFZXj4Qj4XCtEugNqlthlKLIwAAnDBMI6nOrnJpXUCtAL6ShGUw+fRGSxDHx+L4IVymQL6Fwhex2JxhCzxVY4VAQODqdYpLbpKg0ejwDEKC7Na46GwsyggmWGQwsgLOEFU9q6AKTUw2MJzAIdAaGeKQ5KbNI7Pa5UVycVYlrSpxa+mDOwuwEBRw+dX45adMIg6a6mV3UwmtZQ-kWuEI5E2+p2y4OhCKyiLfRWCy2CmGCJ2H0Euz+oNB3VOYkBcN882wqiIuAAVwANnQzonJTjHbo0yEouYAYszFTev4wi5DCDHoMgVXIzXBW3GkmpW1dDKTOZLK4mc5XOq5vjHnNngPggFdE52bEgA */
createMachine({
  id: "bookingMachine",
  tsTypes: {} as import("./booking.machine.typegen").Typegen0,
  schema: {
    context: {} as Context,
    events: {} as
      | BookingMachineEvent
      // | { type: "UPDATE_SEAT_SELECTION"; selections?: string[] }
      // | { type: "UPDATE_TICKET_SELECTION"; tickets: TicketChoiceType }
      | NavigationEvent

  },
  initial: "seats",
  context: {
    seats: [false, false, false, false, false],
    tickets: {
      ADULT: 0,
      // CHILD: 0,
    },
  },
  states: {
    seats: {
      on: {
        UPDATE_SEAT_SELECTION: {
          actions: "storeSeatSelection"
        },
        "NAVIGATION.TICKETS": [
          {
            target: "tickets",
            cond: "seatsSelected",
          },
        ],
      },
    },
    tickets: {
      on: {
        UPDATE_TICKET_SELECTION: {
          actions: "storeTicketSelection"
        },
        "NAVIGATION.SEATS": "seats",
        "NAVIGATION.PERKS": [
          {
            target: "perks",
            cond: "ticketsSelected",
          },
        ],
      },
    },
    perks: {
      on: {
      },
    },
    result: {},
  },
},
{
  guards: {
    seatsSelected: (ctx) => totalSeats(ctx) > 0,
    ticketsSelected: validSelections,
  },
  actions: {
    storeSeatSelection: assign({
      seats: (ctx, event) => {
        // create a new array
        // iterate over ctx.seats
        // if event.selections contains the index, set the value to true in the new array
        // else set the value to false
        // return the new array
        console.log("trying to store seat selection", event);
        const selections = event.selections || [];
        return ctx.seats.map((_, index) => selections.includes(index.toString()));
      },
    }),
    storeTicketSelection: assign({
      tickets: (ctx, event) => {
        // create a new array
        // iterate over ctx.seats
        // if event.selections contains the index, set the value to true in the new array
        // else set the value to false
        // return the new array
        console.log("trying to store ticket selection", event);
        return event.tickets;
      },
    })
  }
});
