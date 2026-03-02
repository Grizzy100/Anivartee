import { Step } from "react-joyride";

export function getDashboardTourSteps(role: string): Step[] {
    if (role === "factchecker" || role === "admin") {
        return [
            {
                target: "body",
                title: "Welcome to your Fact-Checker Dashboard",
                content: "Let's take a quick tour. We'll show you how to find posts to verify, track your rank, and monitor your submitted verdicts.",
                placement: "center",
                disableBeacon: true,
            },
            {
                target: "#tour-post-button",
                title: "+ New Post",
                content: "You can also publish your own original posts. Share insights, research, or fact-based discussions with the community.",
                placement: "bottom",
                disableBeacon: true,
            },
            {
                target: "#tour-calendar",
                title: "Calendar Panel",
                content: "Track your fact-checking consistency. Days where you submitted a verdict (validated or debunked) are marked in blue.",
                placement: "left",
                disableBeacon: true,
            },
            {
                target: "#tour-sidebar-posts",
                title: "My Posts",
                content: "Manage your activity. The 'Posts' tab shows your original content, while the 'Fact-Checks' tab displays a history of all verdicts you've submitted.",
                placement: "right",
                disableBeacon: true,
            },
            {
                target: "#tour-sidebar-profile",
                title: "My Profile & Tiers",
                content: "View your achievements, tier status, and unlockable perks. Reaching higher Fact-Checker ranks allows you to write longer descriptions.",
                placement: "right",
                disableBeacon: true,
            },
            {
                target: "#tour-sidebar-queue",
                title: "Moderation Queue",
                content: "Click here to access unverified community posts. Inside the Queue, you can 'Claim' posts to lock them for review, and then submit a final 'Validate' or 'Debunk' verdict.",
                placement: "right",
                disableBeacon: true,
            },
            {
                target: "#tour-feed",
                title: "Your Feed",
                content: "This is the main feed. Explore community posts, discussions, and verified insights.",
                placement: "center",
                disableBeacon: true,
            },
            {
                target: "body",
                title: "Post Actions: Like & Flag",
                content: "Engage with posts by Liking them if you found them useful. Notice something suspicious? Use the Flag button to push the post to the Moderation Queue for review.",
                placement: "center",
                disableBeacon: true,
            },
            {
                target: "body",
                title: "Post Actions: Share",
                content: "If you find a well-researched fact-check, hit Share to spread the truth outside the platform.",
                placement: "center",
                disableBeacon: true,
            },
            {
                target: "#tour-trending",
                title: "Trending Section",
                content: "Trending topics show the most debated and high-engagement discussions in real time.",
                placement: "left",
                disableBeacon: true,
            },
        ];
    }

    // Default USER Tour
    return [
        {
            target: "body",
            title: "Welcome to Anivartee",
            content: "Let's take a quick tour of your new dashboard. We'll show you how to publish, track your rank, and monitor your posts.",
            placement: "center",
            disableBeacon: true,
        },
        {
            target: "#tour-post-button",
            title: "+ New Post",
            content: "Create and publish a new post. Share insights, research, or fact-based discussions with the community. Include valid sources to get verified faster.",
            placement: "bottom",
            disableBeacon: true,
        },
        {
            target: "#tour-calendar",
            title: "Calendar Panel",
            content: "Track your consistency. Days with at least one post are marked in blue. Stay consistent to unlock milestone achievements.",
            placement: "left",
            disableBeacon: true,
        },
        {
            target: "#tour-sidebar-posts",
            title: "My Posts",
            content: "Manage all your posts here. Track their progress as they go from Pending to Verified or Debunked.",
            placement: "right",
            disableBeacon: true,
        },
        {
            target: "#tour-sidebar-profile",
            title: "My Profile & Tiers",
            content: "View your achievements, tier status, and unlockable perks. You start as a Novice, but ranking up gives access to advanced features.",
            placement: "right",
            disableBeacon: true,
        },
        {
            target: "#tour-feed",
            title: "Your Feed",
            content: "This is your main feed. Explore community posts, discussions, and verified insights.",
            placement: "center",
            disableBeacon: true,
        },
        {
            target: "body",
            title: "Engaging with Posts",
            content: "Like posts to boost their visibility. Notice a fake claim? Tap the Flag icon to alert Fact-Checkers to review it. Share verified insights with your network.",
            placement: "center",
            disableBeacon: true,
        },
        {
            target: "#tour-trending",
            title: "Trending Section",
            content: "Trending topics show the most debated and high-engagement discussions in real time.",
            placement: "left",
            disableBeacon: true,
        },
    ];
}
