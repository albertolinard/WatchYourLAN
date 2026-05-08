import { createSignal, Show } from "solid-js";
import { apiAddHost } from "../functions/api";
import { getHosts } from "../functions/atstart";

interface Props {
  open: () => boolean;
  onClose: () => void;
}

const macRegex = /^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i;

function AddHostModal(props: Props) {
  const [mac, setMac] = createSignal("");
  const [name, setName] = createSignal("");
  const [ip, setIp] = createSignal("");
  const [hw, setHw] = createSignal("");
  const [error, setError] = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);

  const reset = () => {
    setMac("");
    setName("");
    setIp("");
    setHw("");
    setError("");
  };

  const cancel = () => {
    reset();
    props.onClose();
  };

  const submit = async (e: Event) => {
    e.preventDefault();
    setError("");

    const m = mac().trim().toLowerCase().replace(/-/g, ":");
    if (!macRegex.test(m)) {
      setError("Invalid MAC. Format: aa:bb:cc:dd:ee:ff");
      return;
    }

    setSubmitting(true);
    try {
      await apiAddHost(m, name().trim(), ip().trim(), hw().trim());
      await getHosts();
      reset();
      props.onClose();
    } catch (err: any) {
      setError(err?.message ? String(err.message) : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Show when={props.open()}>
      <div class="modal-backdrop fade show" onClick={cancel}></div>
      <div
        class="modal fade show d-block"
        tabindex="-1"
        role="dialog"
        onClick={cancel}
      >
        <div
          class="modal-dialog modal-dialog-centered"
          role="document"
          onClick={(e) => e.stopPropagation()}
        >
          <div class="modal-content">
            <form onSubmit={submit}>
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="bi bi-plus-circle me-2"></i>Add Host
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  aria-label="Close"
                  onClick={cancel}
                ></button>
              </div>
              <div class="modal-body">
                <Show when={error()}>
                  <div class="alert alert-danger py-2 mb-3">{error()}</div>
                </Show>
                <div class="mb-3">
                  <label class="form-label">
                    MAC <span class="text-danger">*</span>
                  </label>
                  <input
                    class="form-control"
                    placeholder="aa:bb:cc:dd:ee:ff"
                    value={mac()}
                    onInput={(e) => setMac(e.currentTarget.value)}
                    autofocus
                    required
                  />
                  <div class="form-text">
                    Colon or dash separated. Required.
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Name</label>
                  <input
                    class="form-control"
                    placeholder="my-device"
                    value={name()}
                    onInput={(e) => setName(e.currentTarget.value)}
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">IP</label>
                  <input
                    class="form-control"
                    placeholder="192.168.0.10"
                    value={ip()}
                    onInput={(e) => setIp(e.currentTarget.value)}
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Hardware</label>
                  <input
                    class="form-control"
                    placeholder="vendor / OS / role"
                    value={hw()}
                    onInput={(e) => setHw(e.currentTarget.value)}
                  />
                </div>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  onClick={cancel}
                  disabled={submitting()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={submitting()}
                >
                  <Show
                    when={submitting()}
                    fallback={
                      <>
                        <i class="bi bi-check-lg me-1"></i>Add
                      </>
                    }
                  >
                    <span
                      class="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Adding...
                  </Show>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Show>
  );
}

export default AddHostModal;
