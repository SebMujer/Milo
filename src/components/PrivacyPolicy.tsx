import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export function PrivacyPolicy() {
	const navigate = useNavigate();

	return (
		<div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-12">
			<Button
				variant="ghost"
				className="w-fit mb-6"
				onClick={() => navigate(-1)}
			>
				<ArrowLeftIcon data-icon="inline-start" />
				Back
			</Button>

			<h1 className="text-3xl font-bold tracking-tight mb-6">Privacy Policy</h1>

			<div className="space-y-6 text-muted-foreground leading-relaxed">
				<section>
					<h2 className="text-xl font-semibold text-foreground mb-2">1. Information We Collect</h2>
					<p>
						We collect information you provide directly to us, such as when you create an
						account, log in, or use our services. This may include your name, email
						address, and authentication credentials.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
					<p>
						We use the information we collect to provide, maintain, and improve our
						services, personalize your experience, and communicate with you about updates
						and changes.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold text-foreground mb-2">3. Information Sharing</h2>
					<p>
						We do not sell, trade, or otherwise transfer your personal information to
						outside parties except in the limited circumstances described in this policy,
						such as when required by law or to protect our rights.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold text-foreground mb-2">4. Data Security</h2>
					<p>
						We implement industry-standard security measures to protect your personal
						information. However, no method of transmission over the internet is 100%
						secure, and we cannot guarantee absolute security.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold text-foreground mb-2">5. Contact Us</h2>
					<p>
						If you have any questions about this Privacy Policy, please contact us at
						our support page.
					</p>
				</section>

				<p className="text-sm pt-4 border-t border-border">
					Last updated: July 16, 2026
				</p>
			</div>
		</div>
	);
}
