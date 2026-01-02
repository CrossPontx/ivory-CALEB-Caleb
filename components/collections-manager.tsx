"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FolderPlus, Folder, Trash2, Edit2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Collection {
  id: number
  name: string
  description: string | null
  isDefault: boolean
  designCount: number
  createdAt: string
}

interface CollectionsManagerProps {
  trigger?: React.ReactNode
  onCollectionChange?: () => void
}

export function CollectionsManager({ trigger, onCollectionChange }: CollectionsManagerProps) {
  const [open, setOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")

  useEffect(() => {
    if (open) {
      loadCollections()
    }
  }, [open])

  const loadCollections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/collections')
      if (response.ok) {
        const data = await response.json()
        setCollections(data.collections || [])
      }
    } catch (error) {
      console.error('Error loading collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) {
      alert('Please enter a collection name')
      return
    }

    try {
      setCreating(true)
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || null,
        }),
      })

      if (response.ok) {
        setNewName("")
        setNewDescription("")
        await loadCollections()
        if (onCollectionChange) {
          onCollectionChange()
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create collection')
      }
    } catch (error) {
      console.error('Error creating collection:', error)
      alert('Failed to create collection')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number, isDefault: boolean) => {
    if (isDefault) {
      alert('Cannot delete default collection')
      return
    }

    if (!confirm('Delete this collection? Designs will be moved to your default collection.')) {
      return
    }

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadCollections()
        if (onCollectionChange) {
          onCollectionChange()
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete collection')
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
      alert('Failed to delete collection')
    }
  }

  const handleUpdate = async (id: number) => {
    if (!newName.trim()) {
      alert('Please enter a collection name')
      return
    }

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || null,
        }),
      })

      if (response.ok) {
        setEditingId(null)
        setNewName("")
        setNewDescription("")
        await loadCollections()
        if (onCollectionChange) {
          onCollectionChange()
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update collection')
      }
    } catch (error) {
      console.error('Error updating collection:', error)
      alert('Failed to update collection')
    }
  }

  const startEdit = (collection: Collection) => {
    setEditingId(collection.id)
    setNewName(collection.name)
    setNewDescription(collection.description || "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setNewName("")
    setNewDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="h-10 px-4 text-xs tracking-wider uppercase">
            <Folder className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Manage Collections
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light tracking-tight">
            Manage Collections
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Create New Collection */}
          <div className="space-y-4 p-4 border border-[#E8E8E8] bg-[#F8F7F5]">
            <h3 className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light">
              Create New Collection
            </h3>
            <div className="space-y-3">
              <Input
                placeholder="Collection name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border-[#E8E8E8] focus:border-[#8B7355] bg-white"
              />
              <Textarea
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="border-[#E8E8E8] focus:border-[#8B7355] bg-white resize-none"
              />
              <Button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="w-full h-10 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 text-xs tracking-widest uppercase rounded-none font-light"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Create Collection
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Collections List */}
          <div className="space-y-3">
            <h3 className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light">
              Your Collections
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#6B6B6B]" />
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12 border border-[#E8E8E8]">
                <Folder className="w-12 h-12 mx-auto mb-3 text-[#E8E8E8]" strokeWidth={1} />
                <p className="text-sm text-[#6B6B6B] font-light">No collections yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="border border-[#E8E8E8] p-4 hover:border-[#8B7355] transition-colors"
                  >
                    {editingId === collection.id ? (
                      <div className="space-y-3">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="border-[#E8E8E8] focus:border-[#8B7355]"
                        />
                        <Textarea
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          rows={2}
                          className="border-[#E8E8E8] focus:border-[#8B7355] resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdate(collection.id)}
                            className="flex-1 h-9 bg-[#1A1A1A] text-white hover:bg-[#8B7355] text-xs"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            className="flex-1 h-9 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-serif text-lg font-light text-[#1A1A1A]">
                              {collection.name}
                            </h4>
                            {collection.isDefault && (
                              <Badge className="bg-[#8B7355] text-white text-[10px] tracking-wider uppercase">
                                Default
                              </Badge>
                            )}
                          </div>
                          {collection.description && (
                            <p className="text-sm text-[#6B6B6B] font-light mb-2">
                              {collection.description}
                            </p>
                          )}
                          <p className="text-xs text-[#6B6B6B] font-light">
                            {collection.designCount} design{collection.designCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!collection.isDefault && (
                            <>
                              <button
                                onClick={() => startEdit(collection)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-[#F8F7F5] transition-colors rounded"
                              >
                                <Edit2 className="w-4 h-4 text-[#6B6B6B]" strokeWidth={1.5} />
                              </button>
                              <button
                                onClick={() => handleDelete(collection.id, collection.isDefault)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-red-50 transition-colors rounded"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
