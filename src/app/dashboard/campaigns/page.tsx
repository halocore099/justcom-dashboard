"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Loader2,
  RefreshCw,
  Megaphone,
  Calendar,
  X,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";
import { api, Campaign } from "@/lib/api";
import { format } from "date-fns";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    cta_text: "",
    background_color: "#3b82f6",
    image_name: "",
    destination_category: "",
    start_date: "",
    end_date: "",
    priority: 0,
    is_active: true,
  });

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCampaigns(true);
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || "Failed to load campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      cta_text: "",
      background_color: "#3b82f6",
      image_name: "",
      destination_category: "",
      start_date: "",
      end_date: "",
      priority: 0,
      is_active: true,
    });
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.start_date || !formData.end_date) {
      setError("Title, start date, and end date are required");
      return;
    }

    setIsSaving(true);
    try {
      await api.createCampaign({
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      });
      await fetchCampaigns();
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCampaign) return;

    setIsSaving(true);
    try {
      await api.updateCampaign(selectedCampaign.id, {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      });
      await fetchCampaigns();
      setSelectedCampaign(null);
      setIsEditing(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to update campaign");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await api.deleteCampaign(id);
      await fetchCampaigns();
      if (selectedCampaign?.id === id) {
        setSelectedCampaign(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete campaign");
    }
  };

  const openEditModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      title: campaign.title,
      subtitle: campaign.subtitle || "",
      cta_text: campaign.cta_text || "",
      background_color: campaign.background_color || "#3b82f6",
      image_name: campaign.image_name || "",
      destination_category: campaign.destination_category || "",
      start_date: campaign.start_date.split("T")[0],
      end_date: campaign.end_date.split("T")[0],
      priority: campaign.priority,
      is_active: campaign.is_active,
    });
    setIsEditing(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const isActive = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);
    return campaign.is_active && now >= start && now <= end;
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#71717a', textTransform: 'uppercase', margin: 0 }}>
              Marketing
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#fafafa', margin: '4px 0 0 0' }}>Campaigns</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchCampaigns}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#a1a1aa',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              onClick={() => { resetForm(); setShowCreateModal(true); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              New Campaign
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            color: '#ef4444',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '44px',
            paddingRight: '16px',
            paddingTop: '12px',
            paddingBottom: '12px',
            backgroundColor: '#16181d',
            border: '1px solid #27272a',
            borderRadius: '10px',
            color: '#fafafa',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              style={{
                backgroundColor: '#16181d',
                border: '1px solid #27272a',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              {/* Campaign Preview */}
              <div
                style={{
                  backgroundColor: campaign.background_color || '#3b82f6',
                  padding: '24px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      backgroundColor: isActive(campaign) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(113, 113, 122, 0.2)',
                      color: isActive(campaign) ? '#10b981' : '#71717a',
                    }}
                  >
                    {isActive(campaign) ? 'Active' : campaign.is_active ? 'Scheduled' : 'Inactive'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Priority: {campaign.priority}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: '0 0 4px 0' }}>{campaign.title}</h3>
                {campaign.subtitle && (
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>{campaign.subtitle}</p>
                )}
                {campaign.cta_text && (
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '12px',
                      padding: '6px 12px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  >
                    {campaign.cta_text}
                  </span>
                )}
              </div>

              {/* Campaign Details */}
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '12px', color: '#71717a' }}>
                  <Calendar size={14} />
                  <span>{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</span>
                </div>
                {campaign.destination_category && (
                  <p style={{ fontSize: '12px', color: '#52525b', margin: '0 0 12px 0' }}>
                    Links to: {campaign.destination_category}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openEditModal(campaign)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px',
                      backgroundColor: '#27272a',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#a1a1aa',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit2 size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#16181d',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
          }}
        >
          <Megaphone size={32} style={{ color: '#3f3f46', marginBottom: '16px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#71717a', margin: 0 }}>No campaigns found</p>
          <p style={{ fontSize: '13px', color: '#52525b', margin: '4px 0 0 0' }}>
            Create your first campaign to get started
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || isEditing) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#16181d',
              border: '1px solid #27272a',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fafafa', margin: 0 }}>
                {isEditing ? 'Edit Campaign' : 'New Campaign'}
              </h2>
              <button
                onClick={() => { setShowCreateModal(false); setIsEditing(false); setSelectedCampaign(null); }}
                style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                <X size={18} style={{ color: '#71717a' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '6px' }}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f1117', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '6px' }}>Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f1117', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '6px' }}>CTA Button Text</label>
                <input
                  type="text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  placeholder="e.g., Shop Now"
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f1117', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '6px' }}>Background Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      style={{ flex: 1, padding: '10px 14px', backgroundColor: '#0f1117', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '6px' }}>Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f1117', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '6px' }}>Destination Category</label>
                <select
                  value={formData.destination_category}
                  onChange={(e) => setFormData({ ...formData, destination_category: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f1117', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', fontSize: '14px', outline: 'none' }}
                >
                  <option value="">None</option>
                  <option value="iphone">iPhone</option>
                  <option value="macbook">MacBook</option>
                  <option value="ipad">iPad</option>
                  <option value="watch">Apple Watch</option>
                  <option value="android">Android</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '6px' }}>Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f1117', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '6px' }}>End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', backgroundColor: '#0f1117', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: formData.is_active ? '#3b82f6' : '#27272a',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '10px',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: formData.is_active ? '22px' : '2px',
                      transition: 'left 0.2s',
                    }}
                  />
                </button>
                <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Campaign Active</span>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => { setShowCreateModal(false); setIsEditing(false); setSelectedCampaign(null); }}
                style={{ padding: '10px 16px', backgroundColor: '#27272a', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={isEditing ? handleUpdate : handleCreate}
                disabled={isSaving}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isSaving ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'white',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                {isEditing ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
