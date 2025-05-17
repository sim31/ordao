import { createFileRoute } from '@tanstack/react-router'
import { config } from '../../global/config';
import { FractalDoc } from '../../components/FractalDoc';

export const Route = createFileRoute('/_app/about/communities')({
  component: RouteComponent,
  loader: async () => {
    if (!config.fractalDocsUrl) {
      return {};
    } else {
      const url = new URL('./communities.md', config.fractalDocsUrl);
      const mdDoc = await fetch(url);
      const mdText = await mdDoc.text();
      console.log("Retrieved: ", mdText);
      return { mdText };
    }
  }
})

function RouteComponent() {
  const { mdText } = Route.useLoaderData();

  return <FractalDoc mdText={mdText} />
}
