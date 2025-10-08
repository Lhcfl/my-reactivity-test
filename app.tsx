import { render, useState, h } from "./runtime.js";

const App = () => {
  return (
    <main>
      <h1>Hello, World</h1>
      <p>This is a simple reactive framework example.</p>
      <p>
        Firstly, a counter component:
        <ButtonCounter />
      </p>
      <p>
        Secondly a todo list
      </p>
      <TodoList />
    </main>
  );
}

const TodoList = () => {
  const [items, setItems] = useState<string[]>([]);
  const [text, setText] = useState("");

  const addItem = () => {
    if (text().trim() === "") return;
    setItems([...items(), text()]);
    setText("");
  }

  const removeItem = (index: number) => {
    const newItems = items().filter((_, i) => i !== index);
    setItems(newItems);
  }

  return (
    <div>
      <h2>Todo List</h2>
      <input
        type="text"
        value={text}
        oninput={(e: Event) => setText((e.target as HTMLInputElement).value)}
      />
      <button onclick={addItem}>Add</button>
      <ul>
        {() => items().map((item, index) => (
          <li>{() => item}, <button onclick={() => removeItem(index)}>Remove</button></li>
        ))}
      </ul>
    </div>
  );
}

const ButtonCounter = () => {
  const [count, setCount] = useState(0);
  return (
    <button onclick={() => setCount(count() + 1)}>
      click me <Counter value={count} />
    </button>
  );
}

const Counter = ({ value }: { value: () => number }) => {
  return (
    <div>
      <p>Count: {value}</p>
    </div>
  );
};

document.addEventListener("DOMContentLoaded", () => {
  render(<App />, document.getElementById("app")!);
});

