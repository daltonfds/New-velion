"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  nome: string;
  slug: string;
  icone: string | null;
  ordem: number;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [order, setOrder] = useState("0");

  async function loadCategories() {
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .order("ordem", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setCategories((data ?? []) as Category[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Category name is required.");
      setSaving(false);
      return;
    }

    const finalSlug = slug.trim() || makeSlug(name);

    const { error: insertError } = await supabase
      .from("categories")
      .insert({
        nome: name.trim(),
        slug: finalSlug,
        icone: icon.trim() || null,
        ordem: Number(order || 0),
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setName("");
    setSlug("");
    setIcon("");
    setOrder("0");
    setSuccess("Category created successfully.");

    await loadCategories();
    setSaving(false);
  }

  async function handleDelete(category: Category) {
    if (
      !window.confirm(
        `Delete "${category.nome}"? Products using this category may prevent deletion.`,
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSuccess("Category deleted successfully.");
    await loadCategories();
  }

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-indigo-600">Commerce</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Organize products into marketplace categories.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Add Category
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Create a category for marketplace products.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-5 p-6">
              <Input
                label="Category Name"
                value={name}
                onChange={(event) => {
                  const value = event.target.value;
                  setName(value);

                  if (!slug) {
                    setSlug(makeSlug(value));
                  }
                }}
                placeholder="e.g. Electronics"
                required
              />

              <Input
                label="Slug"
                value={slug}
                onChange={(event) =>
                  setSlug(makeSlug(event.target.value))
                }
                placeholder="electronics"
                required
              />

              <Input
                label="Icon"
                value={icon}
                onChange={(event) => setIcon(event.target.value)}
                placeholder="Optional"
              />

              <Input
                label="Display Order"
                type="number"
                min="0"
                value={order}
                onChange={(event) => setOrder(event.target.value)}
              />

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Creating..." : "Create Category"}
              </Button>
            </form>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Category List
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {categories.length} categor
                  {categories.length === 1 ? "y" : "ies"}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                No categories found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Slug</th>
                      <th className="px-6 py-4">Order</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {categories.map((category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm text-indigo-600">
                              {category.icone || "•"}
                            </div>

                            <span className="font-medium text-slate-900">
                              {category.nome}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {category.slug}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-700">
                          {category.ordem}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(
                            category.created_at,
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => void handleDelete(category)}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
