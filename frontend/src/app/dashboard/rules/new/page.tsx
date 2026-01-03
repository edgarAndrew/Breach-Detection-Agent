import type { Metadata } from 'next';
import AddRuleForm from '@/components/forms/rule/add-rule-form';

export const metadata: Metadata = {
    title: "Add Rule | ORIX-McLaren",
    description: "Create a new rule to define conditions, thresholds, and actions for monitoring and alerts.",
};

async function AddRulesPage() {

    return (
        <main>
            <section className="mx-auto max-w-4xl px-6 py-10">
                <AddRuleForm />
            </section>

        </main>
    )
}

export default AddRulesPage