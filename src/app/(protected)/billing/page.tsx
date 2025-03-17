"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import { createCheckoutSession } from "~/lib/stripe";
import { api } from "~/trpc/react";

const BillingPage = () => {
  const { data: credits } = api.project.getMyCredits.useQuery();
  const [creditsToBuy, setCreditsToBuy] = React.useState<number[]>([100]);

  const creditsToBuyAmount = creditsToBuy[0]!;

  const price = (creditsToBuyAmount / 50).toFixed(2);

  return (
    <div>
      <h1 className="text-xl font-semibold">Billing</h1>
      <div className="h-2"></div>

      <p className="text-sm text-gray-500">
        You currently have {credits?.credits} credits
      </p>
      <div className="h-2"></div>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <h3 className="mb-2 font-medium">Understanding Credits</h3>
        <p>
          Credits are consumed when you index files or process content in your
          projects:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Each file indexed requires 1 credit</li>
          <li>
            An average project contains approximately 100 files (100 credits)
          </li>
          <li>Credits are non-refundable once used</li>
          <li>Unused credits remain in your account indefinitely</li>
        </ul>
        <p className="mt-2">
          Purchase credits in advance to ensure uninterrupted access to Katara
          AI's features.
        </p>
      </div>

      <div className="h-4"></div>

      <Slider
        defaultValue={[100]}
        max={1000}
        min={10}
        step={10}
        onValueChange={(value) => setCreditsToBuy(value)}
        value={creditsToBuy}
      />

      <div className="h-4"></div>
      <Button
        onClick={() => {
          createCheckoutSession(creditsToBuyAmount);
        }}
      >
        Buy {creditsToBuyAmount} credits for ${price}
      </Button>
    </div>
  );
};

export default BillingPage;
