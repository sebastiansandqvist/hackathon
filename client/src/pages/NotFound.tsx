import { CanvasGridBg, Layout } from '~/components';

export function NotFound() {
  return (
    <Layout>
      <CanvasGridBg>
        <div class="p-8">
          <h1 class="font-pixel text-center text-2xl">Error 404</h1>
        </div>
      </CanvasGridBg>
    </Layout>
  );
}
