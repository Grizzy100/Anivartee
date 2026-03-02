import { Step } from "react-joyride";

export function getModerationTourSteps(): Step[] {
    return [
        {
            target: "body",
            title: "Moderation Queue",
            content: "Welcome to the Moderation Queue. This is where Fact-Checkers review community submissions to filter misinformation.",
            placement: "center",
            disableBeacon: true,
        },
        {
            target: "#tour-moderation-tabs",
            title: "Queue vs Claimed Tabs",
            content: "The Queue tab shows available posts. Once you claim a post, it moves to your Claimed tab. You have 30 minutes to review a claimed post before it returns to the public queue.",
            placement: "bottom-start",
            disableBeacon: true,
        },
        {
            target: "#tour-moderation-tabs",
            title: "Making a Claim",
            content: "Scroll through the queue and click 'Claim' on a post. This locks it so no other Fact-Checkers can review it while you are working on it.",
            placement: "bottom-start",
            disableBeacon: true,
        },
        {
            target: "#tour-moderation-tabs",
            title: "Submitting a Verdict",
            content: "In your Claimed tab, verify the post's sources. Once confident, click 'Validate' if true, or 'Debunk' if false. If you can't verify it, click 'Abandon' to return it to the queue.",
            placement: "bottom-start",
            disableBeacon: true,
        },
    ];
}
