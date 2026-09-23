export interface Tool {
  id: string;
  name: string;
  description: string;
  /** Route to navigate to, or null when the tool is not available yet. */
  route: string | null;
}
