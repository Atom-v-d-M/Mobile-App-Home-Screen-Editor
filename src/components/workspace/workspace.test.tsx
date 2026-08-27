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
  CarouselPreviewClient: ({ section }: { section: { items: unknown[] } }) => (
    <div data-testid="carousel-preview">{section.items.length} items</div>
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
    const li = element.closest("li");
    const parent = li?.parentElement;
    if (li && parent) {
      const index = Array.from(parent.children).indexOf(li);
      return rect(index * 80, 80);
    }
    // The drag overlay is a portalled copy of the card, not an LI. A 640px
    // overlay makes closestCorners skip straight to the last section.
    if (typeof element.className === "string" && element.className.includes("rotate-[3deg]")) {
      return rect(0, 80);
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

    await user.click(screen.getByRole("button", { name: /^text block/i }));
    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "New heading");

    expect(within(screen.getByTestId("preview")).getByText("New heading")).toBeInTheDocument();
  });

  it("duplicates a section under the original and expands the copy", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(previewSections().map((node) => node.dataset.sectionType)).toEqual(["carousel", "text", "cta"]);

    await user.click(screen.getByRole("button", { name: /duplicate text block/i }));

    expect(previewSections().map((node) => node.dataset.sectionType)).toEqual(["carousel", "text", "text", "cta"]);
    expect(within(screen.getByTestId("preview")).getAllByText("Autumn capsule")).toHaveLength(2);

    const title = screen.getByLabelText("Title");
    expect(title).toHaveValue("Autumn capsule");
    expect(screen.getAllByLabelText("Title")).toHaveLength(1);

    await user.clear(title);
    await user.type(title, "Copied heading");
    expect(within(screen.getByTestId("preview")).getByText("Copied heading")).toBeInTheDocument();
    expect(within(screen.getByTestId("preview")).getByText("Autumn capsule")).toBeInTheDocument();
  });

  it("adds a carousel from the add bar", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getAllByTestId("carousel-preview")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Carousel" }));

    expect(screen.getAllByTestId("carousel-preview")).toHaveLength(2);
    expect(previewSections().at(-1)).toHaveAttribute("data-section-type", "carousel");
  });

  it("switches a carousel item to video and infers kind from a pasted file URL", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: /^media carousel/i }));
    expect(screen.getByPlaceholderText("Poster URL (optional)")).toBeInTheDocument();

    const types = screen.getAllByRole("radiogroup", { name: "Type" });
    await user.click(within(types[1]).getByRole("radio", { name: "Image" }));
    expect(screen.queryByPlaceholderText("Poster URL (optional)")).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Paste an image or video URL"), "https://cdn.example/look.mp4");
    await user.click(screen.getByRole("button", { name: "Add media" }));

    expect(screen.getByPlaceholderText("Poster URL (optional)")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-preview")).toHaveTextContent("4 items");
  });

  it("places theme settings above screen settings", () => {
    render(<Harness />);
    const theme = screen.getByRole("button", { name: /theme settings/i });
    const screenSettings = screen.getByRole("button", { name: /screen settings/i });
    expect(theme.compareDocumentPosition(screenSettings) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("drives colour-field presets from the theme palette without rewriting applied colours", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const heading = within(screen.getByTestId("preview")).getByText("Autumn capsule");
    expect(heading).toHaveStyle({ color: "#111111" });

    await user.click(screen.getByRole("button", { name: /theme settings/i }));
    await user.click(screen.getByRole("button", { name: "Add colour" }));
    expect(screen.getByLabelText("Palette colour 7")).toHaveValue("#000000");

    const third = screen.getByLabelText("Palette colour 3");
    expect(third).toHaveValue("#111111");
    await user.clear(third);
    await user.paste("#00FF00");

    expect(heading).toHaveStyle({ color: "#111111" });

    await user.click(screen.getByRole("button", { name: /^text block/i }));
    await user.click(screen.getAllByRole("button", { name: "Use #00FF00" })[0]);

    expect(heading).toHaveStyle({ color: "#00ff00" });
  });

  it("keeps the last valid colour on invalid hex, and applies valid hex", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: /^text block/i }));
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

    const handle = screen.getByRole("button", { name: /reorder media carousel/i });
    handle.focus();
    await user.keyboard("[Space]");
    await user.keyboard("[ArrowDown]");
    await user.keyboard("[Space]");

    expect(previewSections().map((node) => node.dataset.sectionType)).toEqual(["text", "carousel", "cta"]);
  });

  it("shows CTA alignment only when the button is not full width", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: /^cta button/i }));
    expect(screen.queryByRole("radiogroup", { name: "Alignment" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("switch", { name: /full width/i }));
    const alignment = screen.getByRole("radiogroup", { name: "Alignment" });
    await user.click(within(alignment).getByRole("radio", { name: /right/i }));

    const previewCta = within(screen.getByTestId("preview")).getByRole("button", { name: "Shop the drop" });
    expect(previewCta).toHaveClass("w-auto");
    expect(previewCta.parentElement).toHaveClass("justify-end");

    await user.click(screen.getByRole("switch", { name: /full width/i }));
    expect(screen.queryByRole("radiogroup", { name: "Alignment" })).not.toBeInTheDocument();
    expect(within(screen.getByTestId("preview")).getByRole("button", { name: "Shop the drop" })).toHaveClass("w-full");
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
