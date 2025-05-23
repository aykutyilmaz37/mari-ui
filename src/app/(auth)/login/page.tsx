import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="mt-4 w-80 flex rounded-xl bg-gradient-to-r from-primary-light to-primary-muted p-6 pr-[7rem] shadow-inner">
      <div>
        <h3 className="font-medium text-primary">Total balance</h3>
        <p className="mt-4 text-5xl font-thin text-primary">
          <span className="text-xl">$</span> 439,177
        </p>
        <Button type="secondary" className="w-48">
          Test
        </Button>
      </div>
    </div>
  );
}
