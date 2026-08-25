import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { PreviewScreen } from "@/components/preview/PreviewScreen";
import { Toolbar } from "@/components/workspace/Toolbar";
import { ConfigProvider } from "@/state/ConfigContext";
import { UiProvider } from "@/state/UiContext";

// Swiper measures real layout; the preview carousel is stubbed so these tests
// assert on config → DOM, not on Swiper's internals.
vi.mock("@/components/preview/sections/CarouselPreviewClient", () => ({
  CarouselPreviewClient: ({ section }: { section: { images: unknown[] } }) => (
    <div data-testid="carousel-preview">{section.images.length} images</div>
  ),
}));

function Harness() {
  return (
    <ConfigProvider>
      <UiProvider>
        <Toolbar />
        <EditorPanel />
        <div data-testid="preview">
          <PreviewScreen />
        </div>
      </UiProvider>
    </ConfigProvider>
  );
}

/** jsdom gives every element a zero rect; dnd-kit needs stacked boxes. */
function stubListRects() {
  const rect = (top: number, height: number) =>
    ({
      x: 0,
      y: top,
      top,
      bottom: top + height,
      left: 0,
      right: 320,
      width: 320,
      height,
      toJSON: () => ({}),
    }) as DOMRect;

  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const element = this as HTMLElement;
    const parent = element.parentElement;
    if (element.tagName === "LI" && parent) {
      const index = Array.from(parent.children).indexOf(element);
      return rect(index * 80, 80);
    }
    return rect(0, 640);
  });
}

const previewSections = () => screen.getAllByTestId("preview-section");

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("editor → preview", () => {
  it("types a title and the preview updates immediately", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: /text block/i }));
    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "New heading");

    expect(within(screen.getByTestId("preview")).getByText("New heading")).toBeInTheDocument();
  });

  it("adds a carousel from the add bar", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getAllByTestId("carousel-preview")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Carousel" }));

    expect(screen.getAllByTestId("carousel-preview")).toHaveLength(2);
    expect(previewSections().at(-1)).toHaveAttribute("data-section-type", "carousel");
  });

  it("keeps the last valid colour on invalid hex, and applies valid hex", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: /text block/i }));
    const heading = within(screen.getByTestId("preview")).getByText("Autumn capsule");
    expect(heading).toHaveStyle({ color: "#111111" });

    const field = screen.getByLabelText("Title colour");
    await user.clear(field);
    await user.type(field, "#G");

    expect(screen.getByText("Use 3 or 6 hex digits, like #FF6B2C")).toBeInTheDocument();
    expect(heading).toHaveStyle({ color: "#111111" });

    await user.clear(field);
    await user.type(field, "#0000FF");

    expect(heading).toHaveStyle({ color: "#0000ff" });
  });

  it("reorders sections from the keyboard", async () => {
    stubListRects();
    const user = userEvent.setup();
    render(<Harness />);

    expect(previewSections().map((node) => node.dataset.sectionType)).toEqual(["carousel", "text", "cta"]);

    const handle = screen.getByRole("button", { name: /reorder image carousel/i });
    handle.focus();
    await user.keyboard("[Space]");
    await user.keyboard("[ArrowDown]");
    await user.keyboard("[Space]");

    expect(previewSections().map((node) => node.dataset.sectionType)).toEqual(["text", "carousel", "cta"]);
  });

  it("shows a persistent error card for a malformed import and leaves the screen alone", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const before = previewSections().map((node) => node.dataset.sectionType);
    const file = new File(["{not json"], "broken.json", { type: "application/json" });
    await user.upload(screen.getByLabelText("Import screen JSON"), file);

    expect(await screen.findByRole("alert")).toHaveTextContent("That file isn't valid JSON.");
    expect(previewSections().map((node) => node.dataset.sectionType)).toEqual(before);
  });
});
