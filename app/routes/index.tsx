import * as numberInput from "@zag-js/number-input"
import { useMachine, useSetup } from "@zag-js/react"


function NumberInput(
    { name, count, label, onChange }:
    { name: string, count: number, label: string, onChange: (details: { value: string; valueAsNumber: number; }) => void }
  ) {
  const [state, send] = useMachine(
    numberInput.machine({
      onChange,
      name: name,
      value: count.toString(),
      min: 0,
      clampValueOnBlur: true,
    })
  )
  const wrappedSend = (evt) => {
    console.log("current state", state);
    console.log("sending", evt);
    send(evt);
  }
  const ref = useSetup({ send, id: "1" })
  const api = numberInput.connect(state, wrappedSend)

  return (
    <div className="custom-number-input">
      <div ref={ref} {...api.rootProps}>
        <label {...api.labelProps}>{label}</label>
        <div className="input-container">
          <button {...api.decrementButtonProps}><span>-</span></button>
          <input {...api.inputProps} />
          <button {...api.incrementButtonProps}><span>+</span></button>
        </div>
      </div>
    </div>
  )
}

export default function TicketsRoute() {
  const onFormChange = ({ value, valueAsNumber }: {
    value: string;
    valueAsNumber: number;
  }) => {
    console.log({value, valueAsNumber })
  }
  return (
    <div>
      <NumberInput
        key="foo"
        name={`event.tickets.foo`}
        label="foo"
        count={0}
        onChange={onFormChange}
      />
    </div>
  );
}
