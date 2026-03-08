import { useState,useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function TestPage() {

    const [count, setCount] = useState(0);
    const [data,setData]=useState([]);

    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/posts')
            .then(response => response.json())
            .then(data => setData(data));
    }, []);
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-black">{count}</div>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <div>
                {data.map(item => (
                    <div key={item.id} className="my-10">{item.title}</div>
                ))}
            </div>
            <Accordion type="single" collapsible defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>
        </div>

    );
}