import { BOOTHS } from '$lib/schedule';
export const entries = () => BOOTHS.map((b) => ({ key: b.key }));
export const load = ({ params }) => ({ key: params.key });
